import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mf_session')) || null } catch { return null }
  })

  const login = (data) => {
    localStorage.setItem('mf_session', JSON.stringify(data))
    setSession(data)
  }

  const logout = () => {
    localStorage.removeItem('mf_session')
    setSession(null)
  }

  // Check if JWT token is expired
  const isTokenValid = () => {
    if (!session?.token) return false
    try {
      const payload = JSON.parse(atob(session.token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch { return false }
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
