import { useState } from 'react'
import { Download, Upload } from './Icons'
import { useLibrary } from '../store/useLibrary'

export default function ImportExport() {
  const { exportAll, importData } = useLibrary()
  const [status, setStatus] = useState<string>('')

  const handleExport = (filtered?: boolean) => {
    const data = exportAll(filtered)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filtered ? 'nightwatch-filtered.json' : 'nightwatch-library.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Exported JSON')
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const parsed = JSON.parse(text)
      importData(parsed)
      setStatus('Import complete')
    } catch (err) {
      setStatus('Invalid file')
    }
  }

  return (
    <div id="import-export" className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-smoke">
        <Download className="w-5 h-5" /> Library
      </div>
      <p className="text-sm text-smoke">Export your full library or the current filtered set. Re-import to merge changes across devices.</p>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={() => handleExport(false)}>
          <Download className="w-5 h-5" /> Export all
        </button>
        <button className="btn-ghost" onClick={() => handleExport(true)}>
          Export filtered
        </button>
        <label className="btn-ghost cursor-pointer">
          <Upload className="w-5 h-5" /> Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
      </div>
      {status && <p className="text-xs text-smoke">{status}</p>}
    </div>
  )
}
