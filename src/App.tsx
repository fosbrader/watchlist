import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLibrary, useFilteredMovies, MIN_YEAR, MAX_YEAR } from './store/useLibrary'
import { useShortcuts } from './hooks/useShortcut'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import MovieGrid from './components/MovieGrid'
import MovieList from './components/MovieList'
import MovieDetail from './components/MovieDetail'
import CommandPalette from './components/CommandPalette'
import ImportExport from './components/ImportExport'
import SettingsPanel from './components/SettingsPanel'

function Home() {
  const filtered = useFilteredMovies()
  const { filters, setFilters } = useLibrary()

  return (
    <div className="space-y-6">
      <FilterPanel total={filtered.length} minYear={MIN_YEAR} maxYear={MAX_YEAR} />
      {filters.view === 'grid' ? <MovieGrid movies={filtered} /> : <MovieList movies={filtered} />}
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { setFilters } = useLibrary()

  useShortcuts([
    {
      combo: '/',
      handler: () => {
        const input = document.getElementById('search-input') as HTMLInputElement
        input?.focus()
      }
    },
    { combo: 'g', handler: () => setFilters({ view: useLibrary.getState().filters.view === 'grid' ? 'list' : 'grid' }) },
    { combo: 'w', handler: () => setFilters({ watched: useLibrary.getState().filters.watched === 'all' ? 'unwatched' : 'all' }) },
    { combo: 'escape', handler: () => navigate('/') },
    { combo: 'mod+k', handler: () => setPaletteOpen(true) }
  ])

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 md:px-8 pb-12">
      <Header onOpenPalette={() => setPaletteOpen(true)} />
      <main className="space-y-10">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Home />} />
        </Routes>
      </main>

      <AnimatePresence>
        {location.pathname.startsWith('/movie/') && (
          <MovieDetail onClose={() => navigate('/')} />
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onToggleView={() => setFilters({ view: useLibrary.getState().filters.view === 'grid' ? 'list' : 'grid' })} onToggleWatched={() => setFilters({ watched: useLibrary.getState().filters.watched === 'all' ? 'watched' : 'all' })} onReset={() => useLibrary.getState().resetState()} />
      <div className="grid md:grid-cols-2 gap-4 mt-12">
        <ImportExport />
        <SettingsPanel />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <AppShell />
      </motion.div>
    </AnimatePresence>
  )
}
