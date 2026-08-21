import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, setToken, clearToken, getToken } from '../lib/api'
import type { User, Organization } from '../lib/types'

// A login attempt either completes immediately, or (when the account has 2FA
// enabled) comes back needing a second step. Neither branch touches the
// session until a real token is issued.
export type LoginResult = { requiresTotp: false } | { requiresTotp: true; pendingToken: string; name: string }

interface AuthState {
  user: User | null
  org: Organization | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  loginWithTotp: (pendingToken: string, code: string) => Promise<void>
  register: (name: string, email: string, password: string, orgName: string) => Promise<void>
  setSession: (token: string, user: User, org: Organization) => void
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!getToken()) {
      setUser(null)
      setOrg(null)
      setLoading(false)
      return
    }
    try {
      const data = await api<{ user: User; org: Organization }>('/auth/me')
      setUser(data.user)
      setOrg(data.org)
    } catch {
      clearToken()
      setUser(null)
      setOrg(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function login(email: string, password: string): Promise<LoginResult> {
    const data = await api<
      { token: string; user: User; org: Organization } | { requiresTotp: true; pendingToken: string; name: string }
    >('/auth/login', { method: 'POST', body: { email, password } })
    if ('requiresTotp' in data) {
      return { requiresTotp: true, pendingToken: data.pendingToken, name: data.name }
    }
    setToken(data.token)
    setUser(data.user)
    setOrg(data.org)
    return { requiresTotp: false }
  }

  async function loginWithTotp(pendingToken: string, code: string) {
    const data = await api<{ token: string; user: User; org: Organization }>('/auth/login/2fa', {
      method: 'POST',
      body: { pendingToken, code },
    })
    setToken(data.token)
    setUser(data.user)
    setOrg(data.org)
  }

  async function register(name: string, email: string, password: string, orgName: string) {
    const data = await api<{ token: string; user: User; org: Organization }>('/auth/register', {
      method: 'POST',
      body: { name, email, password, orgName },
    })
    setToken(data.token)
    setUser(data.user)
    setOrg(data.org)
  }

  function setSession(token: string, user: User, org: Organization) {
    setToken(token)
    setUser(user)
    setOrg(org)
  }

  function logout() {
    clearToken()
    setUser(null)
    setOrg(null)
  }

  return (
    <AuthContext.Provider value={{ user, org, loading, login, loginWithTotp, register, setSession, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
