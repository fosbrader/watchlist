import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useLibrary } from '../store/useLibrary'

const actions = [
  { id: 'toggle-view', label: 'Toggle grid/list' },
  { id: 'toggle-watched', label: 'Toggle watched filter' },
  { id: 'export', label: 'Export visible set' },
  { id: 'reset', label: 'Reset local data' }
]

export default function CommandPalette({ open, onClose, onToggleView, onToggleWatched, onReset }: { open: boolean; onClose: () => void; onToggleView: () => void; onToggleWatched: () => void; onReset: () => void }) {
  const { exportAll } = useLibrary()
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => actions.filter(action => action.label.toLowerCase().includes(query.toLowerCase())), [query])

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const run = (id: string) => {
    switch (id) {
      case 'toggle-view':
        onToggleView()
        break
      case 'toggle-watched':
        onToggleWatched()
        break
      case 'export': {
        const data = exportAll(true)
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'nightwatch-export.json'
        a.click()
        URL.revokeObjectURL(url)
        break
      }
      case 'reset':
        onReset()
        break
      default:
        break
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl p-4 w-[520px] max-w-full"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs text-smoke mb-2">Command Palette</p>
            <input className="input w-full" placeholder="Type an action" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {filtered.map(action => (
                <button key={action.id} className="w-full text-left btn-ghost" onClick={() => run(action.id)}>
                  {action.label}
                </button>
              ))}
              {!filtered.length && <p className="text-smoke text-sm">No matches.</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
