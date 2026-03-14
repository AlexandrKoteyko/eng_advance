import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [me, setMe] = useState(() => {
    try { return JSON.parse(localStorage.getItem('me') || 'null') }
    catch { return null }
  })

  const getToken = () => localStorage.getItem('access_token')

  const login = (tokens, user) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('me', JSON.stringify(user))
    setMe(user)
  }

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/users/logout/', {
        refresh: localStorage.getItem('refresh_token')
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('me')
    setMe(null)
  }, [])

  const refreshToken = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) return false
    try {
      const res = await axios.post('/api/users/token/refresh/', { refresh })
      localStorage.setItem('access_token', res.data.access)
      return true
    } catch {
      logout()
      return false
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{ me, login, logout, getToken, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)