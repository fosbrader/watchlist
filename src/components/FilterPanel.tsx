import { useMemo } from 'react'
import { Adjust, Grid, List } from './Icons'
import { useLibrary } from '../store/useLibrary'

export default function FilterPanel({ total, minYear, maxYear }: { total: number; minYear: number; maxYear: number }) {
  const { filters, setFilters, movies } = useLibrary()

  const genres = useMemo(() => {
    const set = new Set<string>()
    movies.forEach(m => m.genres.forEach(g => set.add(g)))
    return Array.from(set).sort()
  }, [movies])

  return (
    <section className="glass rounded-2xl p-5 md:p-6 fade-border">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-smoke">
          <Adjust className="w-5 h-5" /> Filters
        </div>
        <div className="text-sm text-smoke">{total} films</div>
      </div>
      <div className="grid md:grid-cols-[1.5fr,1fr] gap-4 md:gap-6 mt-4">
        <div className="space-y-3">
          <input
            id="search-input"
            placeholder="Search titles, genres, or notes"
            className="input w-full"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre}
                className={`badge ${filters.genres.includes(genre) ? 'bg-ember text-white border-ember/50' : ''}`}
                onClick={() =>
                  setFilters({
                    genres: filters.genres.includes(genre)
                      ? filters.genres.filter(g => g !== genre)
                      : [...filters.genres, genre]
                  })
                }
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`btn-ghost justify-center ${filters.view === 'grid' ? 'border-ember/60 text-white' : ''}`}
              onClick={() => setFilters({ view: 'grid' })}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              className={`btn-ghost justify-center ${filters.view === 'list' ? 'border-ember/60 text-white' : ''}`}
              onClick={() => setFilters({ view: 'list' })}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-smoke">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.watched === 'watched'}
                onChange={() => setFilters({ watched: filters.watched === 'watched' ? 'all' : 'watched' })}
              />
              Watched
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.watched === 'unwatched'}
                onChange={() => setFilters({ watched: filters.watched === 'unwatched' ? 'all' : 'unwatched' })}
              />
              Unwatched
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={filters.favoritesOnly} onChange={() => setFilters({ favoritesOnly: !filters.favoritesOnly })} />
              Favorites
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={filters.withPosterOnly} onChange={() => setFilters({ withPosterOnly: !filters.withPosterOnly })} />
              With posters
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={filters.withReviewOnly} onChange={() => setFilters({ withReviewOnly: !filters.withReviewOnly })} />
              With reviews
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-smoke">
              <span>{filters.yearRange[0]}</span>
              <span>Year</span>
              <span>{filters.yearRange[1]}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={minYear}
                max={maxYear}
                value={filters.yearRange[0]}
                onChange={e => setFilters({ yearRange: [Number(e.target.value), filters.yearRange[1]] })}
                className="w-full accent-ember"
              />
              <input
                type="range"
                min={minYear}
                max={maxYear}
                value={filters.yearRange[1]}
                onChange={e => setFilters({ yearRange: [filters.yearRange[0], Number(e.target.value)] })}
                className="w-full accent-ember"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-smoke">Sort by</label>
            <select
              className="input w-full"
              value={filters.sort}
              onChange={e => setFilters({ sort: e.target.value as any })}
            >
              <option value="recentAdded">Recently added</option>
              <option value="recentWatched">Recently watched</option>
              <option value="title">Title</option>
              <option value="year">Year</option>
              <option value="myRating">My rating</option>
              <option value="imdbRating">IMDb rating</option>
              <option value="externalRating">External rating</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
