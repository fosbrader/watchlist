#!/usr/bin/env node
/**
 * Prebuild script to enrich movie data from OMDb API
 * Run with: node scripts/enrich-movies.mjs
 * Requires OMDB_API environment variable
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SEED_PATH = path.join(__dirname, '../src/data/seed.movies.json')
const ENRICHED_PATH = path.join(__dirname, '../src/data/enriched.movies.json')
const OMDB_BASE_URL = 'https://www.omdbapi.com/'

// Rate limiting: OMDb free tier is 1,000 requests/day
const DELAY_MS = 250 // 250ms between requests to be safe

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch movie data from OMDb API
 */
async function fetchFromOMDb(apiKey, movie) {
  const params = new URLSearchParams({
    apikey: apiKey,
    plot: 'full',
    r: 'json'
  })

  // Prefer IMDb ID if available, otherwise use title + year
  if (movie.externalId) {
    params.set('i', movie.externalId)
  } else {
    params.set('t', movie.title)
    params.set('y', movie.year.toString())
  }

  const url = `${OMDB_BASE_URL}?${params.toString()}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`  ⚠ HTTP ${response.status} for "${movie.title}"`)
      return null
    }
    
    const data = await response.json()
    
    if (data.Response === 'False') {
      console.warn(`  ⚠ OMDb: ${data.Error} for "${movie.title}"`)
      return null
    }
    
    return data
  } catch (error) {
    console.error(`  ✗ Fetch error for "${movie.title}":`, error.message)
    return null
  }
}

/**
 * Transform OMDb response to our enriched format
 */
function transformOMDbData(omdbData, originalMovie) {
  return {
    // Keep all original seed data
    ...originalMovie,
    
    // OMDb enrichment
    poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : originalMovie.poster,
    synopsis: omdbData.Plot !== 'N/A' ? omdbData.Plot : originalMovie.synopsis,
    runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : originalMovie.runtime,
    director: omdbData.Director !== 'N/A' ? omdbData.Director : originalMovie.director,
    cast: omdbData.Actors !== 'N/A' ? omdbData.Actors.split(', ') : originalMovie.cast,
    
    // New OMDb fields
    rated: omdbData.Rated !== 'N/A' ? omdbData.Rated : undefined,
    awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : undefined,
    boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : undefined,
    language: omdbData.Language !== 'N/A' ? omdbData.Language : undefined,
    country: omdbData.Country !== 'N/A' ? omdbData.Country : undefined,
    imdbRating: omdbData.imdbRating !== 'N/A' ? parseFloat(omdbData.imdbRating) : undefined,
    imdbVotes: omdbData.imdbVotes !== 'N/A' ? omdbData.imdbVotes : undefined,
    metascore: omdbData.Metascore !== 'N/A' ? parseInt(omdbData.Metascore, 10) : undefined,
    externalId: omdbData.imdbID || originalMovie.externalId,
    
    // Ratings array from OMDb
    reviews: omdbData.Ratings?.map(r => ({
      source: r.Source,
      ratingValue: parseFloat(r.Value.split('/')[0]) || parseFloat(r.Value.replace('%', '')),
      ratingScale: r.Value.includes('/') ? parseFloat(r.Value.split('/')[1]) : 100
    })) || originalMovie.reviews,
    
    // TMDB placeholders for future integration
    tmdbId: undefined,
    tmdbPosterPath: undefined,
    trailerUrl: undefined,
    
    // Enrichment metadata
    enrichedAt: new Date().toISOString()
  }
}

/**
 * Main enrichment function
 */
async function enrichMovies() {
  const apiKey = process.env.OMDB_API
  
  if (!apiKey) {
    console.log('ℹ OMDB_API environment variable not set')
    console.log('  Skipping enrichment - using seed data')
    console.log('  Set OMDB_API to enable movie enrichment')
    
    // Check if enriched file exists with data
    try {
      const existing = await fs.readFile(ENRICHED_PATH, 'utf-8')
      const existingData = JSON.parse(existing)
      if (existingData.length > 0) {
        console.log(`  ✓ Using existing enriched data (${existingData.length} movies)`)
        return
      }
    } catch {
      // No existing enriched data
    }
    
    // Create empty enriched file so app can build
    await fs.writeFile(ENRICHED_PATH, '[]')
    console.log('  ✓ Created empty enriched.movies.json')
    return
  }

  console.log('🎬 Movie Enrichment Script')
  console.log('=' .repeat(50))

  // Load seed data
  let seedMovies
  try {
    const seedContent = await fs.readFile(SEED_PATH, 'utf-8')
    seedMovies = JSON.parse(seedContent)
    console.log(`📁 Loaded ${seedMovies.length} movies from seed data`)
  } catch (error) {
    console.error('✗ Failed to read seed.movies.json:', error.message)
    process.exit(1)
  }

  // Load existing enriched data if available (for incremental updates)
  let existingEnriched = {}
  try {
    const enrichedContent = await fs.readFile(ENRICHED_PATH, 'utf-8')
    const enrichedArray = JSON.parse(enrichedContent)
    enrichedArray.forEach(m => { existingEnriched[m.id] = m })
    console.log(`📁 Found ${enrichedArray.length} previously enriched movies`)
  } catch {
    console.log('📁 No existing enriched data, starting fresh')
  }

  // Enrich movies
  const enrichedMovies = []
  let fetchedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const movie of seedMovies) {
    // Check if already enriched recently (within 30 days)
    const existing = existingEnriched[movie.id]
    if (existing?.enrichedAt) {
      const enrichedDate = new Date(existing.enrichedAt)
      const daysSinceEnriched = (Date.now() - enrichedDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceEnriched < 30) {
        console.log(`⏭ Skipping "${movie.title}" (enriched ${Math.floor(daysSinceEnriched)} days ago)`)
        enrichedMovies.push(existing)
        skippedCount++
        continue
      }
    }

    console.log(`🔍 Fetching "${movie.title}" (${movie.year})...`)
    
    const omdbData = await fetchFromOMDb(apiKey, movie)
    
    if (omdbData) {
      const enriched = transformOMDbData(omdbData, movie)
      enrichedMovies.push(enriched)
      console.log(`  ✓ Enriched with poster, plot, and ${omdbData.Ratings?.length || 0} ratings`)
      fetchedCount++
    } else {
      // Keep original movie data if fetch fails
      enrichedMovies.push({
        ...movie,
        enrichedAt: null // Mark as not enriched
      })
      errorCount++
    }

    // Rate limiting delay
    await sleep(DELAY_MS)
  }

  // Write enriched data
  try {
    await fs.writeFile(ENRICHED_PATH, JSON.stringify(enrichedMovies, null, 2))
    console.log('=' .repeat(50))
    console.log(`✓ Wrote ${enrichedMovies.length} movies to enriched.movies.json`)
    console.log(`  📊 Fetched: ${fetchedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`)
  } catch (error) {
    console.error('✗ Failed to write enriched.movies.json:', error.message)
    process.exit(1)
  }
}

// Run the script
enrichMovies().catch(error => {
  console.error('✗ Unhandled error:', error)
  process.exit(1)
})
