import { useState } from 'react'
import { api } from '../../services/api'
import { Building2 } from 'lucide-react'
export default function AdminBrands() {
  const [form, setForm] = useState({companyName:'',email:'',industry:''})
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleReg = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const res = await api.registerBrand(form); setResult(res.data); setShow(false) }
    catch(err){ alert(err.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Brands</h1><p className="text-sm mt-1" style={{color:'#555'}}>Register and manage brand accounts</p></div>
        <button onClick={()=>{setShow(!show);setResult(null)}} className="btn-primary text-sm" style={{background:'#fbbf24',color:'#0a0a0a'}}>+ Register Brand</button>
      </div>
      {result&&<div className="card p-5 mb-5" style={{borderColor:'rgba(96,165,250,0.3)'}}><p className="font-semibold mb-2" style={{color:'#4ade80'}}>✓ Brand registered</p><p className="text-xs mb-2" style={{color:'#555'}}>Share this key with the brand — shown once only.</p><div className="p-3 rounded" style={{background:'rgba(96,165,250,0.08)',border:'1px solid rgba(96,165,250,0.2)'}}><p className="font-mono text-sm break-all" style={{color:'#60a5fa'}}>{result.apiKey}</p></div></div>}
      {show&&<div className="card p-5 mb-5"><p className="font-semibold text-white mb-4">Register New Brand</p><form onSubmit={handleReg} className="grid grid-cols-2 gap-3"><div><label className="label">Company Name</label><input className="input text-sm" value={form.companyName} onChange={e=>set('companyName',e.target.value)} required /></div><div><label className="label">Email</label><input className="input text-sm" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div><div><label className="label">Industry</label><input className="input text-sm" value={form.industry} onChange={e=>set('industry',e.target.value)} /></div><div className="flex items-end"><button type="submit" disabled={saving} className="btn-primary text-sm" style={{background:'#fbbf24',color:'#0a0a0a'}}>{saving?'Registering...':'Register & Generate Key'}</button></div></form></div>}
      <div className="card p-10 text-center"><Building2 size={24} style={{color:'#333',margin:'0 auto 8px'}}/><p className="text-sm" style={{color:'#555'}}>Use the register form above to create brand accounts and generate API keys.</p></div>
    </div>
  )
}
