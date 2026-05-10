import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import AuthLayout from './AuthLayout'

export default function AgencyAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ agencyName: '', email: '', password: '', confirmPassword: '', website: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.agencyLogin(form.email, form.password)
      login({ userType: 'Agency', id: res.data.userId, name: res.data.name, email: res.data.email, token: res.data.token })
      navigate('/agency')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
    try {
      const res = await api.agencyRegister({ agencyName: form.agencyName, email: form.email, password: form.password, website: form.website })
      login({ userType: 'Agency', id: res.data.userId, name: res.data.name, email: res.data.email, token: res.data.token })
      navigate('/agency')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title={mode === 'login' ? 'Agency Sign In' : 'Register Your Agency'} subtitle="Intelligence-grade tools for influencer marketing" accent="#c084fc">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@agency.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{ background: '#c084fc', color: '#0a0a0a' }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
          <p className="text-center text-sm" style={{ color: '#555' }}>New agency? <button type="button" onClick={() => { setMode('register'); setError('') }} style={{ color: '#c084fc' }}>Register here</button></p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3">
          <div><label className="label">Agency Name</label><input className="input" placeholder="Creative Agency" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@agency.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label className="label">Website</label><input className="input" placeholder="agency.com" value={form.website} onChange={e => set('website', e.target.value)} /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <div><label className="label">Confirm Password</label><input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{ background: '#c084fc', color: '#0a0a0a' }}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
          <p className="text-center text-sm" style={{ color: '#555' }}>Already registered? <button type="button" onClick={() => { setMode('login'); setError('') }} style={{ color: '#c084fc' }}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  )
}
