import { describe, it, expect, beforeEach, vi } from 'vitest'
import { selectFiltered, baseFilter } from '../useLibrary'
import type { Movie, FilterState } from '../../types'

// Mock movie data for testing filters
const testMovies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Thriller One',
    year: 2020,
    genres: ['Thriller', 'Horror'],
    watched: true,
    favorite: true,
    poster: 'https://example.com/poster1.jpg',
    addedAt: '2023-01-01T00:00:00Z',
    myRating: 8,
    imdbRating: 7.5,
    reviews: [{ source: 'IMDb', ratingValue: 7.5, ratingScale: 10 }],
  },
  {
    id: 'movie-2',
    title: 'Mystery Film',
    year: 2018,
    genres: ['Mystery', 'Crime'],
    watched: false,
    addedAt: '2023-02-01T00:00:00Z',
    imdbRating: 8.0,
  },
  {
    id: 'movie-3',
    title: 'Horror Classic',
    year: 2015,
    genres: ['Horror'],
    watched: true,
    poster: 'https://example.com/poster3.jpg',
    addedAt: '2023-03-01T00:00:00Z',
  },
  {
    id: 'movie-4',
    title: 'Action Thriller',
    year: 2022,
    genres: ['Action', 'Thriller'],
    watched: false,
    favorite: true,
    addedAt: '2023-04-01T00:00:00Z',
  },
]

describe('useLibrary filters', () => {
  describe('selectFiltered', () => {
    it('returns all movies with default filters', () => {
      const result = selectFiltered(testMovies, baseFilter, {})
      expect(result).toHaveLength(4)
    })

    it('filters by search term in title', () => {
      const filters: FilterState = { ...baseFilter, search: 'thriller' }
      const result = selectFiltered(testMovies, filters, {})
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(m => m.title.toLowerCase().includes('thriller'))).toBe(true)
    })

    it('filters by single genre', () => {
      const filters: FilterState = { ...baseFilter, genres: ['Horror'] }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(2)
      expect(result.every(m => m.genres.includes('Horror'))).toBe(true)
    })

    it('filters by multiple genres (AND logic)', () => {
      const filters: FilterState = { ...baseFilter, genres: ['Thriller', 'Horror'] }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('movie-1')
    })

    it('filters watched movies only', () => {
      const filters: FilterState = { ...baseFilter, watched: 'watched' }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(2)
      expect(result.every(m => m.watched)).toBe(true)
    })

    it('filters unwatched movies only', () => {
      const filters: FilterState = { ...baseFilter, watched: 'unwatched' }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(2)
      expect(result.every(m => !m.watched)).toBe(true)
    })

    it('filters favorites only', () => {
      const filters: FilterState = { ...baseFilter, favoritesOnly: true }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(2)
      expect(result.every(m => m.favorite)).toBe(true)
    })

    it('filters movies with posters only', () => {
      const filters: FilterState = { ...baseFilter, withPosterOnly: true }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(2)
      expect(result.every(m => m.poster)).toBe(true)
    })

    it('filters movies with reviews only', () => {
      const filters: FilterState = { ...baseFilter, withReviewOnly: true }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('movie-1')
    })

    it('filters by year range', () => {
      const filters: FilterState = { ...baseFilter, yearRange: [2018, 2020] }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(2)
      expect(result.every(m => m.year >= 2018 && m.year <= 2020)).toBe(true)
    })

    it('combines multiple filters', () => {
      const filters: FilterState = {
        ...baseFilter,
        genres: ['Thriller'],
        watched: 'unwatched',
      }
      const result = selectFiltered(testMovies, filters, {})
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('movie-4')
    })
  })

  describe('baseFilter defaults', () => {
    it('has empty search', () => {
      expect(baseFilter.search).toBe('')
    })

    it('has empty genres array', () => {
      expect(baseFilter.genres).toEqual([])
    })

    it('has watched set to all', () => {
      expect(baseFilter.watched).toBe('all')
    })

    it('defaults to list view', () => {
      expect(baseFilter.view).toBe('list')
    })

    it('defaults to recentAdded sort', () => {
      expect(baseFilter.sort).toBe('recentAdded')
    })

    it('has favoritesOnly disabled', () => {
      expect(baseFilter.favoritesOnly).toBe(false)
    })
  })
})
