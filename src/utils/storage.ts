const STORAGE_KEY = 'nightwatch.userState'
const ENRICH_CACHE_KEY = 'nightwatch.enrichment'
const SETTINGS_KEY = 'nightwatch.settings'

export type StoredState = {
  movies: Record<string, any>
}

export type EnrichmentCache = {
  [id: string]: {
    data: any
    fetchedAt: number
  }
}

export type SettingsState = {
  omdbApiKey?: string
}

export const loadState = (): StoredState | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('Unable to read storage', err)
    return null
  }
}

export const saveState = (state: StoredState) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Unable to write storage', err)
  }
}

export const clearState = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export const loadEnrichment = (): EnrichmentCache => {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(ENRICH_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    console.warn('Unable to read enrichment cache', err)
    return {}
  }
}

export const saveEnrichment = (cache: EnrichmentCache) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(ENRICH_CACHE_KEY, JSON.stringify(cache))
  } catch (err) {
    console.warn('Unable to write enrichment cache', err)
  }
}

export const loadSettings = (): SettingsState => {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    console.warn('Unable to read settings', err)
    return {}
  }
}

export const saveSettings = (settings: SettingsState) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    console.warn('Unable to write settings', err)
  }
}
