import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import AuthLayout from './AuthLayout'
export default function AgencyAuth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ agencyName:'', email:'', website:'' })
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
      const res = await api.getAgencyProfile(apiKey)
      login({ userType:'Agency', id:res.data.id, name:res.data.agencyName, apiKey })
      navigate('/agency')
    } catch { setError('Invalid API key.') }
    finally { setLoading(false) }
  }
  const handleSignup = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { const res = await api.registerAgency(form); setRegistered(res.data) }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }
  if (registered) return (
    <AuthLayout title="Your API Key" subtitle="Save this — it cannot be retrieved again" accent="#c084fc">
      <div className="p-4 rounded-lg mb-4" style={{background:'rgba(192,132,252,0.08)',border:'1px solid rgba(192,132,252,0.2)'}}>
        <p className="text-xs mb-2" style={{color:'#555'}}>API Key (shown once)</p>
        <p className="font-mono text-sm break-all" style={{color:'#c084fc'}}>{registered.apiKey}</p>
      </div>
      <div className="p-3 rounded-lg text-sm mb-5" style={{background:'rgba(251,191,36,0.08)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.2)'}}>⚠ Copy and store this key now.</div>
      <button className="btn-primary w-full justify-center" onClick={()=>{ login({userType:'Agency',id:registered.agencyId,name:form.agencyName,apiKey:registered.apiKey}); navigate('/agency') }} style={{background:'#c084fc',color:'#0a0a0a'}}>Continue to Dashboard →</button>
    </AuthLayout>
  )
  return (
    <AuthLayout title={mode==='login'?'Agency Sign In':'Register Your Agency'} subtitle="Intelligence-grade influencer analytics and campaign management" accent="#c084fc">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>{error}</div>}
      {mode==='login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="label">API Key</label><input className="input font-mono" type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} required /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{background:'#c084fc',color:'#0a0a0a'}}>{loading?<span className="spinner"/>:'Sign In'}</button>
          <p className="text-center text-sm" style={{color:'#555'}}>New agency? <button type="button" onClick={()=>setMode('signup')} style={{color:'#c084fc'}}>Register here</button></p>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3">
          <div><label className="label">Agency Name</label><input className="input" placeholder="Ogilvy SA" value={form.agencyName} onChange={e=>set('agencyName',e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
          <div><label className="label">Website</label><input className="input" value={form.website} onChange={e=>set('website',e.target.value)} /></div>
          <button type="submit" className="btn-primary w-full justify-center" disabled={loading} style={{background:'#c084fc',color:'#0a0a0a'}}>{loading?<span className="spinner"/>:'Register & Get API Key'}</button>
          <p className="text-center text-sm" style={{color:'#555'}}>Already registered? <button type="button" onClick={()=>setMode('login')} style={{color:'#c084fc'}}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  )
}
