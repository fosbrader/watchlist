import { useState } from 'react'

export default function Poster({ src, alt, compact = false }: { src?: string; alt: string; compact?: boolean }) {
  const [loaded, setLoaded] = useState(false)
  const placeholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#11141d"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23a9b4c7" font-size="18" font-family="Inter">No poster</text></svg>`)
  const displaySrc = src || placeholder
  return (
    <div className={`relative ${compact ? 'h-full' : 'h-72'} bg-chrome overflow-hidden`}>
      <img
        src={displaySrc}
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition duration-700 ${loaded ? 'opacity-100' : 'opacity-70 blur-md'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
