import { Home } from './Icons'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useLibrary } from '../store/useLibrary'

export default function Header() {
  const watched = useLibrary(state => state.movies.filter(m => m.watched).length)
  const total = useLibrary(state => state.movies.length)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link to="/" className="btn-ghost" aria-label="Go home">
              <Home className="w-5 h-5" />
            </Link>
          )}
          <div>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <p className="text-sm uppercase tracking-[0.35em] text-smoke">Nightwatch</p>
              <h1 className="text-4xl md:text-5xl font-display leading-tight">Cinematic Watchlist</h1>
            </Link>
            <p className="text-smoke max-w-2xl mt-3">An editorial companion to your thrillers. Curate, annotate, and revisit the films that keep you on the edge.</p>
          </div>
        </div>
      </div>
      <motion.div className="glass rounded-2xl p-5 flex flex-wrap items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="text-smoke text-sm">Progress</p>
          <p className="text-2xl font-semibold">{watched} / {total} watched</p>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div>
          <p className="text-smoke text-sm">Mood</p>
          <p className="text-lg">Taut, moody, and ready for late-night sessions.</p>
        </div>
      </motion.div>
    </header>
  )
}
