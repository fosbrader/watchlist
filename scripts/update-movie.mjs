#!/usr/bin/env node

/**
 * Script to update movie data via GitHub Actions
 * Supports: add_movie, toggle_watched, update_movie
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_PATH = path.join(__dirname, '../src/data/seed.movies.json')

async function fetchFromOMDb(imdbId, apiKey) {
  const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`OMDb API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data.Response === 'False') {
    throw new Error(`OMDb error: ${data.Error}`)
  }
  
  return data
}

function parseValue(val) {
  if (val === 'N/A' || val === undefined || val === null) return undefined
  return val
}

function parseNumber(val) {
  if (val === 'N/A' || val === undefined || val === null) return undefined
  const num = parseFloat(val.replace(/,/g, ''))
  return isNaN(num) ? undefined : num
}

function transformOMDbData(omdb) {
  const id = omdb.Title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-') + '-' + omdb.Year
  
  return {
    id,
    title: omdb.Title,
    year: parseInt(omdb.Year, 10),
    genres: omdb.Genre ? omdb.Genre.split(', ').map(g => g.trim()) : [],
    watched: false,
    poster: parseValue(omdb.Poster),
    runtime: parseValue(omdb.Runtime),
    director: parseValue(omdb.Director),
    cast: omdb.Actors && omdb.Actors !== 'N/A' 
      ? omdb.Actors.split(', ').map(a => a.trim())
      : [],
    synopsis: parseValue(omdb.Plot),
    externalId: omdb.imdbID,
    rated: parseValue(omdb.Rated),
    awards: parseValue(omdb.Awards),
    boxOffice: parseValue(omdb.BoxOffice),
    language: parseValue(omdb.Language),
    country: parseValue(omdb.Country),
    imdbRating: parseNumber(omdb.imdbRating),
    imdbVotes: parseValue(omdb.imdbVotes),
    metascore: parseNumber(omdb.Metascore),
    addedAt: new Date().toISOString(),
    enrichedAt: new Date().toISOString()
  }
}

async function addMovie(imdbId, apiKey) {
  console.log(`Adding movie: ${imdbId}`)
  
  const movies = JSON.parse(await fs.readFile(SEED_PATH, 'utf-8'))
  
  // Check if already exists
  const existing = movies.find(m => m.externalId === imdbId)
  if (existing) {
    console.log(`Movie already exists: ${existing.title}`)
    return
  }
  
  const omdbData = await fetchFromOMDb(imdbId, apiKey)
  const movie = transformOMDbData(omdbData)
  
  // Add to beginning of list
  movies.unshift(movie)
  
  await fs.writeFile(SEED_PATH, JSON.stringify(movies, null, 2))
  console.log(`✓ Added: ${movie.title} (${movie.year})`)
}

async function toggleWatched(movieId, watched, favorite, myRating, notes) {
  console.log(`Updating movie: ${movieId}`)
  
  const movies = JSON.parse(await fs.readFile(SEED_PATH, 'utf-8'))
  
  const index = movies.findIndex(m => m.id === movieId)
  if (index === -1) {
    throw new Error(`Movie not found: ${movieId}`)
  }
  
  const movie = movies[index]
  
  // Update fields if provided
  if (watched !== undefined) {
    movie.watched = watched === 'true' || watched === true
    if (movie.watched) {
      movie.watchedAt = new Date().toISOString()
    }
  }
  
  if (favorite !== undefined) {
    movie.favorite = favorite === 'true' || favorite === true
  }
  
  if (myRating !== undefined && myRating !== '') {
    const rating = parseFloat(myRating)
    if (!isNaN(rating) && rating >= 0 && rating <= 10) {
      movie.myRating = rating
    }
  }
  
  if (notes !== undefined && notes !== '') {
    movie.notes = notes
  }
  
  movies[index] = movie
  
  await fs.writeFile(SEED_PATH, JSON.stringify(movies, null, 2))
  console.log(`✓ Updated: ${movie.title}`)
  console.log(`  watched: ${movie.watched}, favorite: ${movie.favorite || false}`)
}

async function main() {
  const action = process.env.ACTION
  const imdbId = process.env.IMDB_ID
  const movieId = process.env.MOVIE_ID
  const watched = process.env.WATCHED
  const favorite = process.env.FAVORITE
  const myRating = process.env.MY_RATING
  const notes = process.env.NOTES
  const apiKey = process.env.OMDB_API
  
  console.log(`Action: ${action}`)
  
  switch (action) {
    case 'add_movie':
      if (!imdbId) {
        throw new Error('IMDB_ID is required for add_movie action')
      }
      if (!apiKey) {
        throw new Error('OMDB_API secret is required for add_movie action')
      }
      await addMovie(imdbId, apiKey)
      break
      
    case 'toggle_watched':
    case 'update_movie':
      if (!movieId) {
        throw new Error('MOVIE_ID is required for toggle_watched/update_movie action')
      }
      await toggleWatched(movieId, watched, favorite, myRating, notes)
      break
      
    default:
      throw new Error(`Unknown action: ${action}`)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
