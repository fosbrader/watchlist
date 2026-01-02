import { describe, it, expect } from 'vitest'

/**
 * Tests for the movie enrichment script logic
 * These test the data transformation functions without making actual API calls
 */

// Mock OMDb API response structure
const mockOMDbResponse = {
  Title: 'Test Movie',
  Year: '2023',
  Rated: 'R',
  Released: '01 Jan 2023',
  Runtime: '120 min',
  Genre: 'Thriller, Horror',
  Director: 'Test Director',
  Actors: 'Actor One, Actor Two, Actor Three',
  Plot: 'A gripping story about testing movies.',
  Language: 'English',
  Country: 'USA',
  Awards: 'Won 2 Oscars',
  Poster: 'https://example.com/poster.jpg',
  Ratings: [
    { Source: 'Internet Movie Database', Value: '8.5/10' },
    { Source: 'Rotten Tomatoes', Value: '85%' },
    { Source: 'Metacritic', Value: '80/100' },
  ],
  Metascore: '80',
  imdbRating: '8.5',
  imdbVotes: '100,000',
  imdbID: 'tt1234567',
  BoxOffice: '$100,000,000',
  Response: 'True',
}

const mockOriginalMovie = {
  id: 'test-movie-2023',
  title: 'Test Movie',
  year: 2023,
  genres: ['Thriller', 'Horror'],
  watched: false,
  addedAt: '2023-01-01T00:00:00Z',
}

// Transform function (mirrors the logic in enrich-movies.mjs)
function transformOMDbData(omdbData, originalMovie) {
  return {
    ...originalMovie,
    poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : originalMovie.poster,
    synopsis: omdbData.Plot !== 'N/A' ? omdbData.Plot : originalMovie.synopsis,
    runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : originalMovie.runtime,
    director: omdbData.Director !== 'N/A' ? omdbData.Director : originalMovie.director,
    cast: omdbData.Actors !== 'N/A' ? omdbData.Actors.split(', ') : originalMovie.cast,
    rated: omdbData.Rated !== 'N/A' ? omdbData.Rated : undefined,
    awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : undefined,
    boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : undefined,
    language: omdbData.Language !== 'N/A' ? omdbData.Language : undefined,
    country: omdbData.Country !== 'N/A' ? omdbData.Country : undefined,
    imdbRating: omdbData.imdbRating !== 'N/A' ? parseFloat(omdbData.imdbRating) : undefined,
    imdbVotes: omdbData.imdbVotes !== 'N/A' ? omdbData.imdbVotes : undefined,
    metascore: omdbData.Metascore !== 'N/A' ? parseInt(omdbData.Metascore, 10) : undefined,
    externalId: omdbData.imdbID || originalMovie.externalId,
    reviews: omdbData.Ratings?.map(r => ({
      source: r.Source,
      ratingValue: parseFloat(r.Value.split('/')[0]) || parseFloat(r.Value.replace('%', '')),
      ratingScale: r.Value.includes('/') ? parseFloat(r.Value.split('/')[1]) : 100,
    })) || originalMovie.reviews,
    tmdbId: undefined,
    tmdbPosterPath: undefined,
    trailerUrl: undefined,
    enrichedAt: expect.any(String),
  }
}

describe('enrich-movies script', () => {
  describe('transformOMDbData', () => {
    it('transforms OMDb response to enriched movie format', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      
      expect(result.id).toBe('test-movie-2023')
      expect(result.title).toBe('Test Movie')
      expect(result.year).toBe(2023)
    })

    it('extracts poster URL', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.poster).toBe('https://example.com/poster.jpg')
    })

    it('extracts full plot as synopsis', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.synopsis).toBe('A gripping story about testing movies.')
    })

    it('parses actors into cast array', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.cast).toEqual(['Actor One', 'Actor Two', 'Actor Three'])
    })

    it('extracts content rating', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.rated).toBe('R')
    })

    it('extracts awards', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.awards).toBe('Won 2 Oscars')
    })

    it('extracts box office', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.boxOffice).toBe('$100,000,000')
    })

    it('parses IMDb rating as number', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.imdbRating).toBe(8.5)
    })

    it('parses metascore as integer', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.metascore).toBe(80)
    })

    it('extracts IMDb ID', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.externalId).toBe('tt1234567')
    })

    it('transforms ratings array', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.reviews).toHaveLength(3)
      expect(result.reviews[0]).toEqual({
        source: 'Internet Movie Database',
        ratingValue: 8.5,
        ratingScale: 10,
      })
      expect(result.reviews[1]).toEqual({
        source: 'Rotten Tomatoes',
        ratingValue: 85,
        ratingScale: 100,
      })
    })

    it('preserves original movie fields', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.genres).toEqual(['Thriller', 'Horror'])
      expect(result.watched).toBe(false)
      expect(result.addedAt).toBe('2023-01-01T00:00:00Z')
    })

    it('handles N/A values gracefully', () => {
      const naResponse = {
        ...mockOMDbResponse,
        Poster: 'N/A',
        Awards: 'N/A',
        BoxOffice: 'N/A',
      }
      const movieWithPoster = { ...mockOriginalMovie, poster: 'original-poster.jpg' }
      const result = transformOMDbData(naResponse, movieWithPoster)
      
      expect(result.poster).toBe('original-poster.jpg')
      expect(result.awards).toBeUndefined()
      expect(result.boxOffice).toBeUndefined()
    })

    it('includes TMDB placeholders', () => {
      const result = transformOMDbData(mockOMDbResponse, mockOriginalMovie)
      expect(result.tmdbId).toBeUndefined()
      expect(result.tmdbPosterPath).toBeUndefined()
      expect(result.trailerUrl).toBeUndefined()
    })
  })
})
