import { useState } from 'react'
import { Settings, Refresh } from './Icons'
import { useLibrary } from '../store/useLibrary'

export default function SettingsPanel() {
  const { settings, setSettings, resetState } = useLibrary()
  const [apiKey, setApiKey] = useState(settings.omdbApiKey || '')
  const [status, setStatus] = useState('')

  const save = () => {
    setSettings({ omdbApiKey: apiKey || undefined })
    setStatus('Saved')
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-smoke">
        <Settings className="w-5 h-5" /> Settings
      </div>
      <p className="text-sm text-smoke">Optionally store an OMDb key to enrich metadata. Data is cached locally for 30 days.</p>
      <label className="text-xs text-smoke">OMDb API key</label>
      <input className="input w-full" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Optional" />
      <div className="flex gap-3">
        <button className="btn-primary" onClick={save}>Save</button>
        <button className="btn-ghost" onClick={() => resetState()}>
          <Refresh className="w-4 h-4" /> Reset local data
        </button>
      </div>
      {status && <p className="text-xs text-smoke">{status}</p>}
    </div>
  )
}
