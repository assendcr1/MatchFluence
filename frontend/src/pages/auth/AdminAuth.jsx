import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
export default function AdminAuth() {
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const handleLogin = (e) => {
    e.preventDefault()
    if (pass === 'matchfluence-admin-2026') {
      login({ userType:'Admin', name:'Administrator', id:'admin' })
      navigate('/admin')
    } else { setError('Incorrect admin password.') }
  }
  return (
    <AuthLayout title="Admin Access" subtitle="Platform management and oversight" accent="#fbbf24">
      {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{background:'rgba(248,113,113,0.1)',color:'#f87171',border:'1px solid rgba(248,113,113,0.2)'}}>{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div><label className="label">Admin Password</label><input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} required /></div>
        <p className="text-xs" style={{color:'#444'}}>Default: matchfluence-admin-2026</p>
        <button type="submit" className="btn-primary w-full justify-center" style={{background:'#fbbf24',color:'#0a0a0a'}}>Access Admin Panel</button>
      </form>
    </AuthLayout>
  )
}
