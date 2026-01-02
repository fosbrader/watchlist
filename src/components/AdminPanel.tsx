import { useState } from 'react'
import { useLibrary } from '../store/useLibrary'
import { ExternalLink, Plus, Check, Heart, Star } from './Icons'

const GITHUB_REPO = 'fosbrader/watchlist' // Update this to your repo

function generateWorkflowUrl(action: string, params: Record<string, string>) {
  // Generate a URL that opens the GitHub Actions workflow dispatch page with prefilled values
  const baseUrl = `https://github.com/${GITHUB_REPO}/actions/workflows/update-movie.yml`
  return baseUrl
}

function MovieQuickEdit({ movie }: { movie: any }) {
  const { updateMovie } = useLibrary()
  
  const handleWatchedToggle = () => {
    updateMovie(movie.id, { 
      watched: !movie.watched,
      watchedAt: !movie.watched ? new Date().toISOString() : undefined
    })
  }
  
  const handleFavoriteToggle = () => {
    updateMovie(movie.id, { favorite: !movie.favorite })
  }
  
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4">
      <img 
        src={movie.poster || '/placeholder.svg'} 
        alt={movie.title}
        className="w-12 h-16 object-cover rounded"
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{movie.title}</h3>
        <p className="text-sm text-smoke">{movie.year}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleWatchedToggle}
          className={`p-2 rounded-lg transition-colors ${
            movie.watched 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-white/5 text-smoke hover:bg-white/10'
          }`}
          aria-label={movie.watched ? 'Mark as unwatched' : 'Mark as watched'}
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={handleFavoriteToggle}
          className={`p-2 rounded-lg transition-colors ${
            movie.favorite 
              ? 'bg-rose-500/20 text-rose-400' 
              : 'bg-white/5 text-smoke hover:bg-white/10'
          }`}
          aria-label={movie.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function AddMovieForm() {
  const [imdbId, setImdbId] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean up IMDb ID input
    let cleanId = imdbId.trim()
    
    // Extract tt ID from URL if pasted
    const urlMatch = cleanId.match(/tt\d+/)
    if (urlMatch) {
      cleanId = urlMatch[0]
    }
    
    if (!cleanId.startsWith('tt')) {
      setStatus('error')
      return
    }
    
    // Open GitHub Actions in new tab with the workflow
    const url = `https://github.com/${GITHUB_REPO}/actions/workflows/update-movie.yml`
    window.open(url, '_blank')
    
    setStatus('success')
    setImdbId('')
    
    // Reset status after 3 seconds
    setTimeout(() => setStatus('idle'), 3000)
  }
  
  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Plus className="w-5 h-5 text-ember" />
        Add New Movie
      </h3>
      <p className="text-sm text-smoke">
        Enter an IMDb ID or URL. This will open GitHub Actions where you can trigger the add.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={imdbId}
          onChange={(e) => setImdbId(e.target.value)}
          placeholder="tt1234567 or IMDb URL"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Add
        </button>
      </div>
      {status === 'success' && (
        <p className="text-sm text-emerald-400">
          ✓ Opening GitHub Actions... Complete the workflow there.
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-rose-400">
          Please enter a valid IMDb ID (starts with 'tt')
        </p>
      )}
      <a 
        href={`https://github.com/${GITHUB_REPO}/actions/workflows/update-movie.yml`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-sky-400 hover:underline flex items-center gap-1"
      >
        Open GitHub Actions <ExternalLink className="w-4 h-4" />
      </a>
    </form>
  )
}

function SyncNotice() {
  return (
    <div className="glass rounded-xl p-4 border-l-4 border-amber-500/50">
      <h3 className="font-semibold text-amber-400 mb-2">📱 Mobile Editing</h3>
      <p className="text-sm text-smoke mb-3">
        Changes made here are saved to your browser's local storage. To permanently save changes to the site:
      </p>
      <ol className="text-sm text-smoke space-y-2 list-decimal list-inside">
        <li>Make your edits below (watched status, favorites, ratings)</li>
        <li>Go to GitHub Actions to run the update workflow</li>
        <li>The site will automatically redeploy with your changes</li>
      </ol>
      <a 
        href={`https://github.com/${GITHUB_REPO}/actions`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-3 text-sm text-sky-400 hover:underline"
      >
        Open GitHub Actions <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  )
}

export default function AdminPanel() {
  const movies = useLibrary(state => state.movies)
  const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('unwatched')
  const [search, setSearch] = useState('')
  
  const filteredMovies = movies.filter(m => {
    if (filter === 'watched' && !m.watched) return false
    if (filter === 'unwatched' && m.watched) return false
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  
  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-display">Quick Edit</h2>
        <p className="text-smoke text-sm mt-1">Manage your watchlist from anywhere</p>
      </div>
      
      <SyncNotice />
      
      <AddMovieForm />
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'unwatched', 'watched'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                filter === f 
                  ? 'bg-ember text-white' 
                  : 'bg-white/5 text-smoke hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <p className="text-xs text-smoke">{filteredMovies.length} movies</p>
      </div>
      
      <div className="space-y-3">
        {filteredMovies.slice(0, 50).map(movie => (
          <MovieQuickEdit key={movie.id} movie={movie} />
        ))}
        {filteredMovies.length > 50 && (
          <p className="text-center text-smoke text-sm">
            Showing first 50 of {filteredMovies.length} movies
          </p>
        )}
      </div>
    </div>
  )
}
