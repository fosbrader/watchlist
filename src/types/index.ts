export type Review = {
  source: string
  ratingValue: number
  ratingScale: number
  snippet?: string
  url?: string
}

export type MovieSeed = {
  id: string
  title: string
  year: number
  genres: string[]
  watched: boolean
  poster?: string
  runtime?: string
  director?: string
  cast?: string[]
  synopsis?: string
  externalId?: string
  reviews?: Review[]
  addedAt?: string
  watchedAt?: string
  externalRating?: number
  
  // OMDb enrichment fields
  rated?: string
  awards?: string
  boxOffice?: string
  language?: string
  country?: string
  imdbRating?: number
  imdbVotes?: string
  metascore?: number
  enrichedAt?: string | null
  
  // TMDB placeholders for future integration
  tmdbId?: string
  tmdbPosterPath?: string
  trailerUrl?: string
}

export type MovieUserState = {
  watched?: boolean
  favorite?: boolean
  myRating?: number
  notes?: string
  dateWatched?: string
  customPosterOverride?: string
  customSynopsisOverride?: string
  poster?: string
}

export type Movie = MovieSeed & MovieUserState & {
  addedAt: string
  watchedAt?: string
}

export type FilterState = {
  search: string
  genres: string[]
  watched: 'all' | 'watched' | 'unwatched'
  favoritesOnly: boolean
  withPosterOnly: boolean
  withReviewOnly: boolean
  yearRange: [number, number]
  view: 'grid' | 'list'
  sort: 'title' | 'year' | 'myRating' | 'externalRating' | 'imdbRating' | 'recentAdded' | 'recentWatched'
}

export type LibraryExport = {
  movies: (MovieSeed & MovieUserState)[]
  generatedAt: string
  filtered?: boolean
}
