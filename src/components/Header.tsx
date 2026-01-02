import { Sparkles, Download } from './Icons'
import { motion } from 'framer-motion'
import { useLibrary } from '../store/useLibrary'

export default function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const watched = useLibrary(state => state.movies.filter(m => m.watched).length)
  const total = useLibrary(state => state.movies.length)

  return (
    <header className="py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-smoke">Nightwatch</p>
          <h1 className="text-4xl md:text-5xl font-display leading-tight">Cinematic Watchlist</h1>
          <p className="text-smoke max-w-2xl mt-3">An editorial companion to your thrillers. Curate, annotate, and revisit the films that keep you on the edge.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="btn-ghost" onClick={onOpenPalette}>
            <Sparkles className="w-5 h-5" />
            Command (⌘K)
          </button>
          <a className="btn-primary" href="#import-export">
            <Download className="w-5 h-5" />
            Import / Export
          </a>
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
