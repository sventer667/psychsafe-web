import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { captureAttribution } from './lib/attribution'

captureAttribution()

// The static HTML carries a canonical link and some JSON-LD for crawlers that
// don't run JavaScript. Remove them here so each page's own code is the only
// source once the app is running (the fallback index.html serves other routes too).
document.querySelectorAll('link[data-prerender="canonical"]').forEach((el) => el.remove())
if (window.location.pathname !== '/' && window.location.pathname !== '/help') {
  document.querySelectorAll('script[data-prerender="ld"]').forEach((el) => el.remove())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
