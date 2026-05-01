import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import AuthLayout from './AuthLayout'
export default function BrandAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ companyName:'', email:'', industry:'', website:'' })
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await api.getBrandProfile(apiKey)
      login({ userType:'Brand', id:res.data.id, name:res.data.companyName, apiKey })
      navigate('/brand')
    } catch { setError('Invalid API key.') }
    finally { setLoading(false) }
  }
  const handleSignup = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { const res = await api.registerBrand(form); setRegistered(res.data) }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }
  if (registered) return (
    <AuthLayout title="Your API Key" subtitle="Save this — it cannot be retrieved again" accent="#60a5fa">
      <div className="p-4 rounded-lg mb-4" style={{background:'rgba(96,165,250,0.08)',border:'1px solid rgba(96,165,250,0.2)'}}>
        <p className="text-xs mb-2" style={{color:'#555'}}>API Key (shown once)</p>
        <p className="font-mono text-sm break-all" style={{color:'#60a5fa'}}>{registered.apiKey}</p>
      </div>
      <div className="p-3 rounded-lg text-sm mb-5" style={{background:'rgba(251,191,36,0.08)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.2)'}}>⚠ Copy and store this key now.</div>
      <button className="btn-primary w-full justify-center" onClick={()=>{ login({userType:'Brand',id:registered.brandId,name:form.companyName,apiKey:registered.apiKey}); navigate('/brand') }} style={{background:'#60a5fa',color:'#0a0a0a'}}>Continue to Dashboard →</button>
    </AuthLayout>
  )
  return (
    <AuthLayout title={mode==='login'?'Brand Sign In':'Register Your Brand'} subtitle="Create campaigns and find perfect influencer matches" accent="#60a5fa">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>{error}</div>}
      {mode==='login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="label">API Key</label><input className="input font-mono" type="password" placeholder="Your API key" value={apiKey} onChange={e=>setApiKey(e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{background:'#60a5fa',color:'#0a0a0a'}}>{loading?<span className="spinner"/>:'Sign In'}</button>
          <p className="text-center text-sm" style={{color:'#555'}}>New brand? <button type="button" onClick={()=>setMode('signup')} style={{color:'#60a5fa'}}>Register here</button></p>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3">
          <div><label className="label">Company Name</label><input className="input" placeholder="Nike SA" value={form.companyName} onChange={e=>set('companyName',e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Industry</label><input className="input" placeholder="Sports" value={form.industry} onChange={e=>set('industry',e.target.value)} /></div>
            <div><label className="label">Website</label><input className="input" placeholder="brand.com" value={form.website} onChange={e=>set('website',e.target.value)} /></div>
          </div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{background:'#60a5fa',color:'#0a0a0a'}}>{loading?<span className="spinner"/>:'Register & Get API Key'}</button>
          <p className="text-center text-sm" style={{color:'#555'}}>Already registered? <button type="button" onClick={()=>setMode('login')} style={{color:'#60a5fa'}}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  )
}
