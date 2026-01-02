import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Heart, ArrowLeft, External, Play, Trophy } from './Icons'
import Poster from './Poster'
import Tag from './Tag'
import Rating from './Rating'
import { useLibrary } from '../store/useLibrary'
import type { Review } from '../types'

/**
 * Generate a YouTube search URL for movie trailers
 */
function getTrailerSearchUrl(title: string, year: number): string {
  const query = encodeURIComponent(`${title} ${year} official trailer`)
  return `https://www.youtube.com/results?search_query=${query}`
}

/**
 * Generate a YouTube embed search URL (uses first result)
 */
function getYouTubeEmbedSearchUrl(title: string, year: number): string {
  const query = encodeURIComponent(`${title} ${year} official trailer`)
  return `https://www.youtube.com/embed?listType=search&list=${query}`
}

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { movies, toggleFavorite, toggleWatched, setMyRating, setNotes } = useLibrary()
  const movie = movies.find(m => m.id === id)
  const [notesDraft, setNotesDraft] = useState(movie?.notes || '')
  const [ratingDraft, setRatingDraft] = useState(movie?.myRating || 0)

  useEffect(() => {
    setNotesDraft(movie?.notes || '')
    setRatingDraft(movie?.myRating || 0)
  }, [movie?.notes, movie?.myRating])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const normalizedReviews: Review[] = useMemo(() => {
    if (!movie) return []
    return movie.reviews || []
  }, [movie])

  if (!movie) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-display">Movie not found</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="w-5 h-5" /> Back to library
          </Link>
        </div>
      </div>
    )
  }

  const hasAwards = movie.awards && movie.awards !== 'N/A'
  const trailerUrl = movie.trailerUrl || getTrailerSearchUrl(movie.title, movie.year)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="btn-ghost">
          <ArrowLeft className="w-5 h-5" /> Back to library
        </button>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-[350px,1fr] gap-8">
        {/* Left column - Poster */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Poster src={movie.customPosterOverride || movie.poster} alt={movie.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status badges */}
            <div className="absolute top-3 right-3 flex gap-2">
              {movie.favorite && (
                <span className="bg-ember/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Favorite
                </span>
              )}
              {movie.watched && (
                <span className="bg-aurora/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Watched
                </span>
              )}
            </div>

            {/* Content rating badge */}
            {movie.rated && (
              <div className="absolute top-3 left-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold border border-white/20">
                  {movie.rated}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button 
              className={`btn-primary flex-1 justify-center ${movie.watched ? 'bg-aurora/80 hover:bg-aurora/70' : ''}`} 
              onClick={() => toggleWatched(movie.id)}
            >
              <CheckCircle className="w-5 h-5" /> {movie.watched ? 'Watched' : 'Mark watched'}
            </button>
            <button 
              className={`btn-ghost flex-1 justify-center ${movie.favorite ? 'border-ember/60 text-ember' : ''}`} 
              onClick={() => toggleFavorite(movie.id)}
            >
              <Heart className="w-5 h-5" /> {movie.favorite ? 'Favorited' : 'Favorite'}
            </button>
          </div>

          {/* Watch trailer button */}
          <a 
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full justify-center"
          >
            <Play className="w-5 h-5" /> Watch Trailer
          </a>
        </div>

        {/* Right column - Details */}
        <div className="space-y-6">
          {/* Title and meta */}
          <div>
            <h1 className="text-4xl md:text-5xl font-display leading-tight mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-smoke">
              <span>{movie.year}</span>
              {movie.runtime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-smoke" />
                  <span>{movie.runtime}</span>
                </>
              )}
              {movie.director && (
                <>
                  <span className="w-1 h-1 rounded-full bg-smoke" />
                  <span>Directed by {movie.director}</span>
                </>
              )}
            </div>
          </div>

          {/* Genres */}
          <div className="flex gap-2 flex-wrap">
            {movie.genres.map(genre => <Tag key={genre} label={genre} />)}
          </div>

          {/* Awards */}
          {hasAwards && (
            <div className="glass rounded-xl p-4 flex items-start gap-3">
              <Trophy className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">Awards</p>
                <p className="text-sm text-white/90">{movie.awards}</p>
              </div>
            </div>
          )}

          {/* Ratings */}
          <div className="glass rounded-xl p-4 space-y-3">
            <Rating 
              rating={movie.myRating} 
              external={movie.imdbRating || movie.externalRating} 
            />
            
            {/* IMDb & Metascore */}
            <div className="flex flex-wrap gap-4 text-sm">
              {movie.imdbRating && (
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-black font-bold px-2 py-0.5 rounded text-xs">IMDb</span>
                  <span>{movie.imdbRating}/10</span>
                  {movie.imdbVotes && <span className="text-smoke">({movie.imdbVotes} votes)</span>}
                </div>
              )}
              {movie.metascore && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    movie.metascore >= 60 ? 'bg-green-500' : 
                    movie.metascore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  } text-black`}>
                    {movie.metascore}
                  </span>
                  <span>Metascore</span>
                </div>
              )}
            </div>
          </div>

          {/* Plot */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Synopsis</h2>
            <p className="text-smoke leading-relaxed">
              {movie.customSynopsisOverride || movie.synopsis || 'No synopsis available.'}
            </p>
          </div>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Cast</h2>
              <p className="text-smoke">{movie.cast.join(', ')}</p>
            </div>
          )}

          {/* Additional info */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {movie.language && (
              <div>
                <p className="text-smoke">Language</p>
                <p>{movie.language}</p>
              </div>
            )}
            {movie.country && (
              <div>
                <p className="text-smoke">Country</p>
                <p>{movie.country}</p>
              </div>
            )}
            {movie.boxOffice && (
              <div>
                <p className="text-smoke">Box Office</p>
                <p className="text-aurora font-semibold">{movie.boxOffice}</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          {normalizedReviews.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <div className="space-y-2">
                {normalizedReviews.map((rev, idx) => (
                  <div key={idx} className="glass rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{rev.source}</p>
                      <p className="text-xs text-smoke">{rev.ratingValue}/{rev.ratingScale}</p>
                      {rev.snippet && <p className="text-sm text-white/90 mt-1">"{rev.snippet}"</p>}
                    </div>
                    {rev.url && (
                      <a className="btn-ghost" href={rev.url} target="_blank" rel="noreferrer">
                        <External className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your rating */}
          <div className="glass rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Your Rating</h2>
            <input 
              type="range" 
              min={0} 
              max={10} 
              step={0.5} 
              value={ratingDraft} 
              onChange={e => setRatingDraft(Number(e.target.value))} 
              onBlur={() => setMyRating(movie.id, ratingDraft)} 
              className="w-full accent-ember" 
            />
            <div className="text-2xl font-display text-ember">{ratingDraft.toFixed(1)} / 10</div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Your Notes</h2>
            <textarea 
              value={notesDraft} 
              onChange={e => setNotesDraft(e.target.value)} 
              onBlur={() => setNotes(movie.id, notesDraft)} 
              className="input w-full h-32" 
              placeholder="What lingered after the credits? Add your thoughts..." 
            />
          </div>

          {/* External links */}
          {movie.externalId && (
            <div className="flex gap-2">
              <a 
                className="btn-ghost" 
                href={`https://www.imdb.com/title/${movie.externalId}/`} 
                target="_blank" 
                rel="noreferrer"
              >
                <External className="w-4 h-4" /> View on IMDb
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
