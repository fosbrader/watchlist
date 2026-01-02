import { Link } from 'react-router-dom'
import type { Movie } from '../types'
import Poster from './Poster'
import Rating from './Rating'
import { Heart, CheckCircle } from './Icons'

export default function MovieList({ movies }: { movies: Movie[] }) {
  if (!movies.length) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-smoke">
        <p className="font-display text-2xl mb-2">No titles found</p>
        <p>Try widening the year range or clearing search.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {movies.map(movie => (
        <Link key={movie.id} to={`/movie/${movie.id}`} className="glass rounded-xl p-3 md:p-4 flex gap-3 card-hover items-center">
          <div className="w-24 h-24 shrink-0 overflow-hidden rounded-lg">
            <Poster src={movie.customPosterOverride || movie.poster} alt={movie.title} compact />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-smoke text-xs">{movie.year}</p>
              {movie.favorite && <Heart className="w-4 h-4 text-ember" />}
              {movie.watched && <CheckCircle className="w-4 h-4 text-aurora" />}
            </div>
            <h3 className="text-lg font-semibold leading-tight">{movie.title}</h3>
            <p className="text-sm text-smoke line-clamp-2">{movie.synopsis || 'A thriller waiting to be discovered.'}</p>
            <div className="mt-2">
              <Rating rating={movie.myRating} external={movie.externalRating} small />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
