import { createContext, useContext, useState } from 'react'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mf_session')) || null } catch { return null }
  })
  const login = (data) => { localStorage.setItem('mf_session', JSON.stringify(data)); setSession(data) }
  const logout = () => { localStorage.removeItem('mf_session'); setSession(null) }
  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
