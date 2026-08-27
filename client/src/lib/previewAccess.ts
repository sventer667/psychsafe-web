// Shared pre-launch demo bypass. Loading the site with ?unlock=<PREVIEW_SECRET>
// anywhere in the query string unlocks the real app in that browser even
// while the frontend's maintenance mode is on (see App.tsx), and every API
// call this app makes then carries the same value in an X-Preview-Access
// header so the backend's matching gate (see server/src/index.ts,
// PREVIEW_ACCESS_SECRET) lets those requests through too.
//
// This is a single shared secret protecting one trust boundary ("can see
// the pre-launch site at all"), not per-layer security, anyone who extracts
// this value from the shipped JS bundle gets both. That's an accepted
// tradeoff for a pre-launch demo link, not something to reuse post-launch.
export const PREVIEW_ACCESS_KEY = 'connexus_preview_access'
export const PREVIEW_SECRET = '9zls-p0fe-ykf8'

export function hasPreviewAccess(): boolean {
  try {
    if (window.localStorage.getItem(PREVIEW_ACCESS_KEY) === 'true') return true
    if (new URLSearchParams(window.location.search).get('unlock') === PREVIEW_SECRET) {
      window.localStorage.setItem(PREVIEW_ACCESS_KEY, 'true')
      return true
    }
    return false
  } catch {
    return false
  }
}
