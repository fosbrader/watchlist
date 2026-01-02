import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number }

const create = (path: React.ReactNode) => ({ size = 24, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} {...props}>
    {path}
  </svg>
)

export const Sparkles = create(
  <>
    <path d="M12 3v3m0 12v3m8-9h-3M7 12H4m11.657-6.343-2.121 2.121M7.464 16.536l-2.12 2.121M7.464 7.464l-2.12-2.12m11.313 11.313-2.121-2.121" />
    <circle cx="12" cy="12" r="2.5" />
  </>
)

export const Download = create(<path d="M12 3v12m0 0 4-4m-4 4-4-4m-5 8h18" />)
export const Upload = create(<path d="M12 21V9m0 0-4 4m4-4 4 4M3 6h18" />)
export const Grid = create(<path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />)
export const List = create(<path d="M9 6h12M9 12h12M9 18h12M5 6h.01M5 12h.01M5 18h.01" />)
export const Heart = create(<path d="M12 21s-6-4.35-9-8.35C1 9 2.5 5.5 6 5.5c2 0 3.5 1.5 4 2.5.5-1 2-2.5 4-2.5 3.5 0 5 3.5 3 7.15-3 4-9 8.35-9 8.35Z" />)
export const CheckCircle = create(<path d="M9.5 12.5 11 14l3.5-4.5m6.5 2.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />)
export const XMark = create(<path d="m6 6 12 12M18 6 6 18" />)
export const External = create(<path d="M14 3h7v7m-1.5-5.5L10 14m-7 7h9a2 2 0 0 0 2-2v-3m0-10H5a2 2 0 0 0-2 2v9" />)
export const Settings = create(<path d="M12 4.5c.6 0 1.2.05 1.77.16l.83-1.43 2.6 1.5-.83 1.44a7.5 7.5 0 0 1 1.5 1.5l1.43-.83 1.5 2.6-1.44.83c.11.57.17 1.16.17 1.76s-.06 1.19-.17 1.76l1.44.83-1.5 2.6-1.43-.83a7.5 7.5 0 0 1-1.5 1.5l.83 1.44-2.6 1.5-.83-1.43c-.57.11-1.16.17-1.76.17s-1.19-.06-1.76-.17l-.83 1.43-2.6-1.5.83-1.44a7.5 7.5 0 0 1-1.5-1.5l-1.44.83-1.5-2.6 1.44-.83A7.5 7.5 0 0 1 4.5 12c0-.6.05-1.19.16-1.76l-1.43-.83 1.5-2.6 1.44.83a7.5 7.5 0 0 1 1.5-1.5l-.83-1.44 2.6-1.5.83 1.43c.57-.11 1.16-.17 1.76-.17Zm0 4.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />)
export const Refresh = create(<path d="M4 4v6h6M20 20v-6h-6M5 19a7 7 0 0 0 11-2M19 5a7 7 0 0 0-11 2" />)
export const Adjust = create(<path d="M4 7h16M4 12h10M4 17h7" />)
export const Star = create(<path d="m12 3.5 2.5 5 5.5.8-4 4 1 5.7-5-2.7-5 2.7 1-5.7-4-4 5.5-.8Z" />)
export const ArrowPathRight = create(<path d="M13 5h6v6m-1.5-4.5-5 5M11 19H5v-6m1.5 4.5 5-5" />)
export const Home = create(<path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />)
export const ArrowLeft = create(<path d="M19 12H5m0 0l7 7m-7-7l7-7" />)
export const Play = create(<path d="M5 3l14 9-14 9V3z" />)
export const Trophy = create(<path d="M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18M6 9h12M6 9v5a6 6 0 0012 0V9M9 21h6m-3-3v3" />)
export const Plus = create(<path d="M12 5v14m7-7H5" />)
export const Check = create(<path d="M5 12l5 5L20 7" />)
export const ExternalLink = create(<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" />)
