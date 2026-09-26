import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch(API_BASE + '/auth/me', {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        setUser(null)
        return null
      }
      const data = await response.json().catch(() => ({}))
      const currentUser = data?.data?.data || data?.data || null
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false))
  }, [refreshAuth])

  const login = useCallback(async ({ email, password }) => {
    const response = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error = new Error(data?.message || 'Login failed.')
      error.status = response.status
      throw error
    }

    const loggedInUser = data?.data?.data?.user || data?.data?.user || null
    setUser(loggedInUser)
    if (!loggedInUser) await refreshAuth()
    return loggedInUser || user
  }, [refreshAuth, user])

  const logout = useCallback(async () => {
    try {
      await fetch(API_BASE + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), refreshAuth, login, logout }),
    [user, loading, refreshAuth, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
