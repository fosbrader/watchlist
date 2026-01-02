import { create } from 'zustand'
import Fuse from 'fuse.js'
import seedData from '../data/seed.movies.json'
import enrichedData from '../data/enriched.movies.json'
import { loadState, saveState, clearState, loadEnrichment, saveEnrichment, loadSettings, saveSettings } from '../utils/storage'
import type { FilterState, LibraryExport, Movie, MovieSeed, MovieUserState } from '../types'

// Use enriched data if available, otherwise fall back to seed data
const movieData: MovieSeed[] = (enrichedData as MovieSeed[]).length > 0 
  ? (enrichedData as MovieSeed[]) 
  : (seedData as MovieSeed[])

const MIN_YEAR = Math.min(...movieData.map(m => m.year))
const MAX_YEAR = Math.max(...movieData.map(m => m.year))

const baseFilter: FilterState = {
  search: '',
  genres: [],
  watched: 'all',
  favoritesOnly: false,
  withPosterOnly: false,
  withReviewOnly: false,
  yearRange: [MIN_YEAR, MAX_YEAR],
  view: 'list',
  sort: 'recentAdded'
}

type LibraryState = {
  movies: Movie[]
  filters: FilterState
  enrichmentCache: Record<string, any>
  settings: { omdbApiKey?: string }
  setFilters: (updater: Partial<FilterState>) => void
  toggleWatched: (id: string) => void
  toggleFavorite: (id: string) => void
  setMyRating: (id: string, rating: number) => void
  setNotes: (id: string, notes: string) => void
  setCustomPoster: (id: string, poster: string) => void
  setCustomSynopsis: (id: string, synopsis: string) => void
  updateMovie: (id: string, updates: Partial<Movie>) => void
  resetState: () => void
  exportAll: (filteredOnly?: boolean) => LibraryExport
  importData: (payload: LibraryExport) => void
  refreshEnrichment: (id: string, data: any) => void
  setSettings: (settings: { omdbApiKey?: string }) => void
}

const mergeMovies = (seeds: MovieSeed[], stored: Record<string, MovieUserState>): Movie[] => {
  return seeds.map(seed => {
    const user = stored[seed.id] || {}
    const addedAt = seed.addedAt || new Date().toISOString()
    const watchedAt = user.dateWatched || seed.watchedAt
    return { ...seed, ...user, addedAt, watchedAt }
  })
}

const persistMovies = (movies: Movie[]) => {
  const normalized: Record<string, MovieUserState> = {}
  movies.forEach(movie => {
    const { watched, favorite, myRating, notes, dateWatched, customPosterOverride, customSynopsisOverride, poster } = movie
    normalized[movie.id] = { watched, favorite, myRating, notes, dateWatched, customPosterOverride, customSynopsisOverride, poster }
  })
  saveState({ movies: normalized })
}

export const useLibrary = create<LibraryState>((set, get) => {
  const stored = loadState()?.movies || {}
  const movies = mergeMovies(movieData, stored)
  const enrichmentCache = loadEnrichment()
  const settings = loadSettings()

  const sync = (updater: (movies: Movie[]) => Movie[]) => {
    set(state => {
      const updated = updater(state.movies)
      persistMovies(updated)
      return { ...state, movies: updated }
    })
  }

  return {
    movies,
    filters: baseFilter,
    enrichmentCache,
    settings,
    setFilters: updater => set(state => ({ filters: { ...state.filters, ...updater } })),
    toggleWatched: id =>
      sync(movies =>
        movies.map(m =>
          m.id === id
            ? {
                ...m,
                watched: !m.watched,
                dateWatched: !m.watched ? new Date().toISOString() : undefined,
                watchedAt: !m.watched ? new Date().toISOString() : undefined
              }
            : m
        )
      ),
    toggleFavorite: id => sync(movies => movies.map(m => (m.id === id ? { ...m, favorite: !m.favorite } : m))),
    setMyRating: (id, rating) => sync(movies => movies.map(m => (m.id === id ? { ...m, myRating: rating } : m))),
    setNotes: (id, notes) => sync(movies => movies.map(m => (m.id === id ? { ...m, notes } : m))),
    setCustomPoster: (id, poster) => sync(movies => movies.map(m => (m.id === id ? { ...m, customPosterOverride: poster } : m))),
    setCustomSynopsis: (id, synopsis) => sync(movies => movies.map(m => (m.id === id ? { ...m, customSynopsisOverride: synopsis } : m))),
    updateMovie: (id, updates) => sync(movies => movies.map(m => (m.id === id ? { ...m, ...updates } : m))),
    resetState: () => {
      clearState()
      set({ movies: mergeMovies(movieData, {}), filters: baseFilter })
    },
    exportAll: (filteredOnly) => {
      const state = get()
      const movies = filteredOnly ? selectFiltered(state.movies, state.filters, state.enrichmentCache) : state.movies
      return {
        movies: movies.map(({ ...movie }) => movie),
        generatedAt: new Date().toISOString(),
        filtered: filteredOnly
      }
    },
    importData: payload => {
      set(state => {
        const incoming: Record<string, MovieUserState> = {}
        payload.movies.forEach(m => {
          const key = m.id || `${m.title}-${m.year}`.toLowerCase().replace(/\s+/g, '-')
          const current = state.movies.find(existing => existing.id === key || (existing.title === m.title && existing.year === m.year))
          if (current) {
            incoming[current.id] = {
              watched: m.watched,
              favorite: m.favorite,
              myRating: m.myRating,
              notes: m.notes,
              dateWatched: m.dateWatched,
              customPosterOverride: m.customPosterOverride,
              customSynopsisOverride: m.customSynopsisOverride,
              poster: m.poster
            }
          }
        })
        const merged = mergeMovies(movieData, incoming)
        persistMovies(merged)
        return { ...state, movies: merged }
      })
    },
    refreshEnrichment: (id, data) => {
      const cache = { ...get().enrichmentCache, [id]: { data, fetchedAt: Date.now() } }
      saveEnrichment(cache)
      set({ enrichmentCache: cache })
    },
    setSettings: settings => {
      saveSettings(settings)
      set({ settings })
    }
  }
})

const selectFiltered = (movies: Movie[], filters: FilterState, enrichmentCache: Record<string, any>): Movie[] => {
  const fuse = new Fuse(movies, { keys: ['title', 'genres', 'notes'], threshold: 0.35 })
  const searched = filters.search ? fuse.search(filters.search).map((r: any) => r.item) : movies

  return searched
    .filter(m => (filters.genres.length ? filters.genres.every(g => m.genres.includes(g)) : true))
    .filter(m =>
      filters.watched === 'all' ? true : filters.watched === 'watched' ? m.watched : !m.watched
    )
    .filter(m => (filters.favoritesOnly ? m.favorite : true))
    .filter(m => (filters.withPosterOnly ? Boolean(m.customPosterOverride || m.poster) : true))
    .filter(m => (filters.withReviewOnly ? Boolean(m.reviews?.length || enrichmentCache[m.id]) : true))
    .filter(m => m.year >= filters.yearRange[0] && m.year <= filters.yearRange[1])
}

export const useFilteredMovies = () => {
  const movies = useLibrary(state => state.movies)
  const filters = useLibrary(state => state.filters)
  const enrichmentCache = useLibrary(state => state.enrichmentCache)
  const filtered = selectFiltered(movies, filters, enrichmentCache)
  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'year':
        return b.year - a.year
      case 'myRating':
        return (b.myRating || 0) - (a.myRating || 0)
      case 'externalRating':
        return (b.externalRating || 0) - (a.externalRating || 0)
      case 'imdbRating':
        return (b.imdbRating || 0) - (a.imdbRating || 0)
      case 'recentWatched':
        return new Date(b.dateWatched || 0).getTime() - new Date(a.dateWatched || 0).getTime()
      case 'recentAdded':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    }
  })
  return sorted
}

export { MIN_YEAR, MAX_YEAR, baseFilter, selectFiltered }
