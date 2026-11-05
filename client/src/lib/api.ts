import { hasPreviewAccess, PREVIEW_SECRET } from './previewAccess'

// In dev this stays empty and requests go through the Vite proxy (see vite.config.ts).
// In production, set VITE_API_URL to your deployed backend, e.g. https://api.example.com/api
export const API_BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'humanora_token'
const ENDED_KEY = 'humanora_session_ended'

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

// Set when the server ends this browser's session (signed in elsewhere, or
// signed out from another device). The login page shows it once.
export function takeSessionEndedMessage(): string | null {
  const m = sessionStorage.getItem(ENDED_KEY)
  if (m) sessionStorage.removeItem(ENDED_KEY)
  return m
}

export class ApiError extends Error {
  status: number
  code?: string
  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(hasPreviewAccess() ? { 'X-Preview-Access': PREVIEW_SECRET } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    if (res.status === 401 && data?.code === 'SESSION_ENDED' && token) {
      clearToken()
      sessionStorage.setItem(ENDED_KEY, data.error || 'You were signed out. Please sign in again.')
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login')
    }
    throw new ApiError(res.status, (data && data.error) || res.statusText, data?.code)
  }
  return data as T
}
