import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import AuthLayout from './AuthLayout'
export default function InfluencerAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', displayName:'', email:'', platform:'Instagram', nicheId:1, marketId:1, followerCount:0, engagementRate:0, botScore:0, instagramHandle:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.getInfluencerByUsername(form.displayName)
      const inf = res.data
      login({ userType:'Influencer', id:inf.id, name:inf.displayName, displayName:inf.displayName })
      navigate('/influencer')
    } catch { setError('Influencer not found. Check your display name or sign up.') }
    finally { setLoading(false) }
  }
  const handleSignup = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.registerInfluencer(form)
      const inf = res.data
      login({ userType:'Influencer', id:inf.id, name:inf.displayName, displayName:inf.displayName })
      navigate('/influencer')
    } catch (err) { setError(err.response?.data?.message || 'Signup failed.') }
    finally { setLoading(false) }
  }
  return (
    <AuthLayout title={mode==='login'?'Influencer Sign In':'Join as Influencer'} subtitle="Track your metrics, campaigns, and connect your social accounts" accent="#2dd4bf">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>{error}</div>}
      {mode==='login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="label">Display Name</label><input className="input" placeholder="e.g. thabofit" value={form.displayName} onChange={e=>set('displayName',e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{background:'#2dd4bf'}}>{loading?<span className="spinner"/>:'Sign In'}</button>
          <p className="text-center text-sm" style={{color:'#555'}}>New here? <button type="button" onClick={()=>setMode('signup')} style={{color:'#2dd4bf'}}>Create account</button></p>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Full Name</label><input className="input" placeholder="Thabo Nkosi" value={form.name} onChange={e=>set('name',e.target.value)} required /></div>
            <div><label className="label">Display Name</label><input className="input" placeholder="thabofit" value={form.displayName} onChange={e=>set('displayName',e.target.value)} required /></div>
          </div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
          <div><label className="label">Instagram Handle</label><input className="input" placeholder="@handle" value={form.instagramHandle} onChange={e=>set('instagramHandle',e.target.value)} /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{background:'#2dd4bf'}}>{loading?<span className="spinner"/>:'Create Account'}</button>
          <p className="text-center text-sm" style={{color:'#555'}}>Already registered? <button type="button" onClick={()=>setMode('login')} style={{color:'#2dd4bf'}}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  )
}
