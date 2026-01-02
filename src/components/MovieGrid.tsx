import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Movie } from '../types'
import Poster from './Poster'
import Tag from './Tag'
import Rating from './Rating'
import { Heart, CheckCircle } from './Icons'
import { useLibrary } from '../store/useLibrary'

export default function MovieGrid({ movies }: { movies: Movie[] }) {
  if (!movies.length) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-smoke">
        <p className="font-display text-2xl mb-2">No titles found</p>
        <p>Adjust filters or import more films to keep the thrill alive.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie, idx) => (
        <motion.div key={movie.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
          <Link to={`/movie/${movie.id}`} className="block glass rounded-2xl overflow-hidden card-hover h-full">
            <div className="relative">
              <Poster src={movie.customPosterOverride || movie.poster} alt={movie.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-3 right-3 flex gap-2">
                {movie.favorite && <Heart className="w-6 h-6 text-ember drop-shadow" />}
                {movie.watched && <CheckCircle className="w-6 h-6 text-aurora drop-shadow" />}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-xs text-smoke">{movie.year} • {movie.genres.join(', ')}</p>
                <h3 className="text-xl font-semibold leading-tight">{movie.title}</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 3).map(genre => <Tag key={genre} label={genre} />)}
              </div>
              <Rating rating={movie.myRating} external={movie.externalRating} />
              {movie.notes && <p className="text-sm text-smoke line-clamp-2">“{movie.notes}”</p>}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
