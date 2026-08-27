import { useEffect } from 'react'

// Visiting this exact secret path (see App.tsx) unlocks the real app in this
// browser even while VITE_MAINTENANCE_MODE is on, by setting a flag in
// localStorage. Everyone else keeps seeing the "coming soon" placeholder.
// This is a soft, obscurity-based gate meant to let a demo through, not a
// real access control, actual account data is still protected by normal
// login. Full reload (not client-side navigate) so App.tsx re-evaluates the
// flag from a clean start.
export const PREVIEW_ACCESS_KEY = 'connexus_preview_access'

export function PreviewUnlock() {
  useEffect(() => {
    window.localStorage.setItem(PREVIEW_ACCESS_KEY, 'true')
    window.location.replace('/')
  }, [])

  return null
}
