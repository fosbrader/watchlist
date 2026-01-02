import { useEffect } from 'react'

type Shortcut = {
  combo: string
  handler: (event: KeyboardEvent) => void
}

export function useShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const combo = `${event.metaKey || event.ctrlKey ? 'mod+' : ''}${event.key.toLowerCase()}`
      shortcuts.forEach(shortcut => {
        if (combo === shortcut.combo) {
          event.preventDefault()
          shortcut.handler(event)
        }
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcuts])
}
