import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
export default function InfluencerSettings() {
  const { session } = useAuth()
  const [inf, setInf] = useState(null)
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    Promise.all([api.getInfluencerById(session.id),api.getNiches(),api.getMarkets()]).then(([i,n,m])=>{setInf(i.data);setNiches(n.data);setMarkets(m.data)}).finally(()=>setLoading(false))
  }, [])
  const set = (k,v) => setInf(p=>({...p,[k]:v}))
  const handleSave = async () => {
    setSaving(true)
    try { await api.updateInfluencer(session.id,inf); setSaved(true); setTimeout(()=>setSaved(false),2000) }
    catch {} finally { setSaving(false) }
  }
  if (loading) return <Loader />
  return (
    <div className="p-7 page-fade max-w-lg">
      <h1 className="text-xl font-bold text-white mb-7" style={{fontFamily:'Syne,sans-serif'}}>Profile Settings</h1>
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Name</label><input className="input" value={inf?.name||''} onChange={e=>set('name',e.target.value)} /></div>
          <div><label className="label">Display Name</label><input className="input" value={inf?.displayName||''} onChange={e=>set('displayName',e.target.value)} /></div>
        </div>
        <div><label className="label">Email</label><input className="input" type="email" value={inf?.email||''} onChange={e=>set('email',e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Niche</label><select className="input" value={inf?.nicheId||''} onChange={e=>set('nicheId',parseInt(e.target.value))}>{niches.map(n=><option key={n.id} value={n.id}>{n.nicheName}</option>)}</select></div>
          <div><label className="label">Market</label><select className="input" value={inf?.marketId||''} onChange={e=>set('marketId',parseInt(e.target.value))}>{markets.map(m=><option key={m.id} value={m.id}>{m.marketName}</option>)}</select></div>
        </div>
        <div><label className="label">Instagram Handle</label><input className="input" placeholder="@handle" value={inf?.instagramHandle||''} onChange={e=>set('instagramHandle',e.target.value)} /></div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{background:'#2dd4bf'}}>
          {saving?'Saving...':saved?'✓ Saved':'Save Changes'}
        </button>
      </div>
    </div>
  )
}
