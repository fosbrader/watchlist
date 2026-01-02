import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLibrary, useFilteredMovies, MIN_YEAR, MAX_YEAR } from './store/useLibrary'
import { useShortcuts } from './hooks/useShortcut'
import Header from './components/Header'
import FilterPanel from './components/FilterPanel'
import MovieGrid from './components/MovieGrid'
import MovieList from './components/MovieList'
import MovieDetailPage from './components/MovieDetailPage'
import SettingsPanel from './components/SettingsPanel'
import AdminPanel from './components/AdminPanel'

function Home() {
  const filtered = useFilteredMovies()
  const { filters } = useLibrary()

  return (
    <div className="space-y-6">
      <FilterPanel total={filtered.length} minYear={MIN_YEAR} maxYear={MAX_YEAR} />
      {filters.view === 'grid' ? <MovieGrid movies={filtered} /> : <MovieList movies={filtered} />}
      
      {/* Settings at bottom of home page */}
      <div className="max-w-md mx-auto mt-12">
        <SettingsPanel />
      </div>
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
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
    { combo: 'escape', handler: () => navigate('/') }
  ])

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 md:px-8 pb-12">
      <Header />
      <main className="space-y-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </AnimatePresence>
      </main>
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
