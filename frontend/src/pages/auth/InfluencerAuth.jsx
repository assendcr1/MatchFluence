import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import AuthLayout from './AuthLayout'

export default function InfluencerAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '', instagramHandle: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.influencerLogin(form.email, form.password)
      login({ userType: 'Influencer', id: res.data.userId, name: res.data.name, displayName: res.data.displayName, email: res.data.email, token: res.data.token })
      navigate('/influencer')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
    try {
      const res = await api.influencerRegister({ displayName: form.displayName, email: form.email, password: form.password, instagramHandle: form.instagramHandle })
      login({ userType: 'Influencer', id: res.data.userId, name: res.data.name, displayName: res.data.displayName, email: res.data.email, token: res.data.token })
      navigate('/influencer')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title={mode === 'login' ? 'Influencer Sign In' : 'Join MatchFluence'} subtitle="Get discovered by Africa's top brands" accent="#3ad6c2">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{ background: '#3ad6c2', color: '#0a0a0a' }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
          <p className="text-center text-sm" style={{ color: '#555' }}>New here? <button type="button" onClick={() => { setMode('register'); setError('') }} style={{ color: '#3ad6c2' }}>Create an account</button></p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3">
          <div><label className="label">Your Name</label><input className="input" placeholder="Your full name" value={form.displayName} onChange={e => set('displayName', e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label className="label">Instagram Handle</label><input className="input" placeholder="@yourhandle" value={form.instagramHandle} onChange={e => set('instagramHandle', e.target.value)} /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <div><label className="label">Confirm Password</label><input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{ background: '#3ad6c2', color: '#0a0a0a' }}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
          <p className="text-center text-sm" style={{ color: '#555' }}>Already have an account? <button type="button" onClick={() => { setMode('login'); setError('') }} style={{ color: '#3ad6c2' }}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  )
}
