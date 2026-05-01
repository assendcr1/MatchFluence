import { useState } from 'react'
import { api } from '../../services/api'
import { Briefcase } from 'lucide-react'
export default function AdminAgencies() {
  const [form, setForm] = useState({agencyName:'',email:'',website:''})
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleReg = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const res = await api.registerAgency(form); setResult(res.data); setShow(false) }
    catch(err){ alert(err.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Agencies</h1><p className="text-sm mt-1" style={{color:'#555'}}>Register and manage agency accounts</p></div>
        <button onClick={()=>{setShow(!show);setResult(null)}} className="btn-primary text-sm" style={{background:'#fbbf24',color:'#0a0a0a'}}>+ Register Agency</button>
      </div>
      {result&&<div className="card p-5 mb-5" style={{borderColor:'rgba(192,132,252,0.3)'}}><p className="font-semibold mb-2" style={{color:'#4ade80'}}>✓ Agency registered</p><p className="text-xs mb-2" style={{color:'#555'}}>Share this key — shown once only.</p><div className="p-3 rounded" style={{background:'rgba(192,132,252,0.08)',border:'1px solid rgba(192,132,252,0.2)'}}><p className="font-mono text-sm break-all" style={{color:'#c084fc'}}>{result.apiKey}</p></div></div>}
      {show&&<div className="card p-5 mb-5"><p className="font-semibold text-white mb-4">Register New Agency</p><form onSubmit={handleReg} className="grid grid-cols-2 gap-3"><div><label className="label">Agency Name</label><input className="input text-sm" value={form.agencyName} onChange={e=>set('agencyName',e.target.value)} required /></div><div><label className="label">Email</label><input className="input text-sm" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div><div><label className="label">Website</label><input className="input text-sm" value={form.website} onChange={e=>set('website',e.target.value)} /></div><div className="flex items-end"><button type="submit" disabled={saving} className="btn-primary text-sm" style={{background:'#fbbf24',color:'#0a0a0a'}}>{saving?'Registering...':'Register & Generate Key'}</button></div></form></div>}
      <div className="card p-10 text-center"><Briefcase size={24} style={{color:'#333',margin:'0 auto 8px'}}/><p className="text-sm" style={{color:'#555'}}>Use the register form above to create agency accounts.</p></div>
    </div>
  )
}
