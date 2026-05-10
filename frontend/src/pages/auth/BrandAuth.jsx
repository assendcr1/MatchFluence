import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import AuthLayout from './AuthLayout'

export default function BrandAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ companyName: '', email: '', password: '', confirmPassword: '', industry: '', website: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.brandLogin(form.email, form.password)
      login({ userType: 'Brand', id: res.data.userId, name: res.data.name, email: res.data.email, token: res.data.token })
      navigate('/brand')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
    try {
      const res = await api.brandRegister({ companyName: form.companyName, email: form.email, password: form.password, industry: form.industry, website: form.website })
      login({ userType: 'Brand', id: res.data.userId, name: res.data.name, email: res.data.email, token: res.data.token })
      navigate('/brand')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title={mode === 'login' ? 'Brand Sign In' : 'Register Your Brand'} subtitle="Create campaigns and find perfect influencer matches" accent="#60a5fa">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{error}</div>}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@brand.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{ background: '#60a5fa', color: '#0a0a0a' }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
          <p className="text-center text-sm" style={{ color: '#555' }}>New brand? <button type="button" onClick={() => { setMode('register'); setError('') }} style={{ color: '#60a5fa' }}>Register here</button></p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3">
          <div><label className="label">Company Name</label><input className="input" placeholder="Nike SA" value={form.companyName} onChange={e => set('companyName', e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@brand.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Industry</label><input className="input" placeholder="Fashion" value={form.industry} onChange={e => set('industry', e.target.value)} /></div>
            <div><label className="label">Website</label><input className="input" placeholder="brand.com" value={form.website} onChange={e => set('website', e.target.value)} /></div>
          </div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
          <div><label className="label">Confirm Password</label><input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{ background: '#60a5fa', color: '#0a0a0a' }}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
          <p className="text-center text-sm" style={{ color: '#555' }}>Already registered? <button type="button" onClick={() => { setMode('login'); setError('') }} style={{ color: '#60a5fa' }}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  )
}
