import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Heart, XMark, External } from './Icons'
import Poster from './Poster'
import Tag from './Tag'
import Rating from './Rating'
import { useLibrary } from '../store/useLibrary'
import type { Review } from '../types'
import localEnrichment from '../data/local.enrichment.json'

export default function MovieDetail({ onClose }: { onClose: () => void }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { movies, toggleFavorite, toggleWatched, setMyRating, setNotes, enrichmentCache, refreshEnrichment, settings } = useLibrary()
  const movie = movies.find(m => m.id === id)
  const [notesDraft, setNotesDraft] = useState(movie?.notes || '')
  const [ratingDraft, setRatingDraft] = useState(movie?.myRating || 0)
  const cached = movie ? enrichmentCache[movie.id] : null
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setNotesDraft(movie?.notes || '')
    setRatingDraft(movie?.myRating || 0)
  }, [movie?.notes, movie?.myRating])

  useEffect(() => {
    if (!movie) return
    const apiKey = settings.omdbApiKey
    const ttl = 1000 * 60 * 60 * 24 * 30
    const now = Date.now()
    if (cached && now - cached.fetchedAt < ttl) return
    const localData = (localEnrichment as any)[movie.id]
    if (localData) {
      refreshEnrichment(movie.id, localData)
      return
    }
    if (!apiKey) return
    const controller = new AbortController()
    const fetchData = async () => {
      try {
        setLoading(true)
        const resp = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.externalId || ''}&t=${encodeURIComponent(movie.title)}&y=${movie.year}`)
        const data = await resp.json()
        refreshEnrichment(movie.id, data)
      } catch (err) {
        console.warn('OMDb fetch failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => controller.abort()
  }, [movie?.id, settings.omdbApiKey])

  const normalizedReviews: Review[] = useMemo(() => {
    if (!movie) return []
    const local = movie.reviews || []
    const enriched = cached?.data?.ratings?.map((r: any) => normalizeRating(r))?.filter(Boolean) || []
    return [...local, ...enriched]
  }, [cached, movie])

  if (!movie) return null

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <motion.div
        className="dialog-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-[1fr,1.2fr]">
          <div className="relative h-full">
            <Poster src={movie.customPosterOverride || movie.poster} alt={movie.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <button className="absolute top-3 right-3 btn-ghost" onClick={onClose} aria-label="Close">
              <XMark className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 space-y-2">
              <p className="text-smoke text-sm">{movie.year} • {movie.runtime || 'TBD'}</p>
              <h2 className="text-3xl font-display max-w-sm leading-tight">{movie.title}</h2>
              <div className="flex gap-2 flex-wrap">
                {movie.genres.map(genre => <Tag key={genre} label={genre} />)}
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-4 overflow-y-auto max-h-[80vh]">
            <div className="flex items-center gap-3 flex-wrap">
              <button className={`btn-primary ${movie.watched ? 'bg-aurora/80' : ''}`} onClick={() => toggleWatched(movie.id)}>
                <CheckCircle className="w-5 h-5" /> {movie.watched ? 'Watched' : 'Mark watched'}
              </button>
              <button className={`btn-ghost ${movie.favorite ? 'border-ember/60 text-white' : ''}`} onClick={() => toggleFavorite(movie.id)}>
                <Heart className="w-5 h-5" /> {movie.favorite ? 'Favorited' : 'Add favorite'}
              </button>
            </div>
            <p className="text-sm text-smoke leading-relaxed">{movie.customSynopsisOverride || movie.synopsis || 'Add your own synopsis to remember why this matters.'}</p>
            <Rating rating={movie.myRating} external={cached?.data?.imdbRating ? Number(cached.data.imdbRating) : movie.externalRating} />
            <div className="space-y-2">
              <label className="text-sm text-smoke">Your rating</label>
              <input type="range" min={0} max={10} step={0.5} value={ratingDraft} onChange={e => setRatingDraft(Number(e.target.value))} onBlur={() => setMyRating(movie.id, ratingDraft)} className="w-full accent-ember" />
              <div className="text-sm text-smoke">{ratingDraft.toFixed(1)}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-smoke">Notes</label>
              <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} onBlur={() => setNotes(movie.id, notesDraft)} className="input w-full h-28" placeholder="What lingered after the credits?" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-smoke">Reviews & pulses</p>
              <div className="space-y-2">
                {normalizedReviews.length === 0 && (
                  <div className="text-sm text-smoke">No reviews yet. Bring your own verdict.</div>
                )}
                {normalizedReviews.map((rev, idx) => (
                  <div key={idx} className="glass rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{rev.source}</p>
                      <p className="text-xs text-smoke">{rev.ratingValue}/{rev.ratingScale}</p>
                      {rev.snippet && <p className="text-sm text-white/90">“{rev.snippet}”</p>}
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
            {cached?.data?.Website && (
              <a className="btn-ghost" href={cached.data.Website} target="_blank" rel="noreferrer">
                Open IMDb
              </a>
            )}
            {loading && <p className="text-xs text-smoke">Refreshing details…</p>}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const normalizeRating = (rating: any): Review | null => {
  if (!rating?.Value) return null
  const [value, scale] = rating.Value.split('/').map((v: string) => parseFloat(v))
  if (!value || !scale) return null
  return { source: rating.Source, ratingValue: value, ratingScale: scale }
}
