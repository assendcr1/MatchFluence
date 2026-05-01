import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import BotBadge from '../../components/BotBadge'
import { Plus, Trash2, RefreshCw, Edit2, X, Check } from 'lucide-react'
const E = { name:'',displayName:'',email:'',platform:'Instagram',nicheId:1,marketId:1,followerCount:0,engagementRate:0,botScore:0,instagramHandle:'' }
export default function AdminInfluencers() {
  const [influencers, setInfluencers] = useState([])
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(E)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const load = () => { setLoading(true); Promise.all([api.getInfluencers(),api.getNiches(),api.getMarkets()]).then(([i,n,m])=>{setInfluencers(i.data);setNiches(n.data);setMarkets(m.data)}).finally(()=>setLoading(false)) }
  useEffect(()=>{ load() },[])
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await api.createInfluencer(form); setShowAdd(false); setForm(E); load() }
    catch(err){ setError(err.response?.data?.message||'Failed.') }
    finally { setSaving(false) }
  }
  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await api.updateInfluencer(editing.id,form); setEditing(null); setForm(E); load() }
    catch { setError('Failed to update.') }
    finally { setSaving(false) }
  }
  const handleDelete = async (id) => { if(!confirm('Delete?'))return; try{await api.deleteInfluencer(id);load()}catch{alert('Delete failed.')} }
  const handleRefresh = async (id) => { try{await api.refreshOne(id);alert('Refresh triggered.')}catch{alert('Failed.')} }
  const startEdit = (inf) => { setEditing(inf); setForm({name:inf.name,displayName:inf.displayName,email:inf.email,platform:inf.platform,nicheId:inf.nicheId,marketId:inf.marketId,followerCount:inf.followerCount,engagementRate:inf.engagementRate,botScore:inf.botScore,instagramHandle:inf.instagramHandle||''}); setShowAdd(false) }
  if(loading)return <Loader />
  const FormPanel = ({onSubmit,title}) => (
    <div className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-4"><p className="font-semibold text-white">{title}</p><button onClick={()=>{setShowAdd(false);setEditing(null)}} style={{color:'#444'}}><X size={15}/></button></div>
      {error&&<div className="mb-3 p-2 rounded text-xs" style={{background:'rgba(248,113,113,0.1)',color:'#f87171'}}>{error}</div>}
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
        <div><label className="label">Name</label><input className="input text-sm" value={form.name} onChange={e=>set('name',e.target.value)} required /></div>
        <div><label className="label">Display Name</label><input className="input text-sm" value={form.displayName} onChange={e=>set('displayName',e.target.value)} required /></div>
        <div><label className="label">Email</label><input className="input text-sm" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
        <div><label className="label">Platform</label><select className="input text-sm" value={form.platform} onChange={e=>set('platform',e.target.value)}>{['Instagram','TikTok','YouTube','Twitter'].map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label className="label">Niche</label><select className="input text-sm" value={form.nicheId} onChange={e=>set('nicheId',parseInt(e.target.value))}>{niches.map(n=><option key={n.id} value={n.id}>{n.nicheName}</option>)}</select></div>
        <div><label className="label">Market</label><select className="input text-sm" value={form.marketId} onChange={e=>set('marketId',parseInt(e.target.value))}>{markets.map(m=><option key={m.id} value={m.id}>{m.marketName}</option>)}</select></div>
        <div><label className="label">Followers</label><input className="input text-sm" type="number" value={form.followerCount} onChange={e=>set('followerCount',parseInt(e.target.value))} /></div>
        <div><label className="label">Engagement Rate</label><input className="input text-sm" type="number" step="0.1" value={form.engagementRate} onChange={e=>set('engagementRate',parseFloat(e.target.value))} /></div>
        <div><label className="label">Instagram Handle</label><input className="input text-sm" placeholder="@handle" value={form.instagramHandle} onChange={e=>set('instagramHandle',e.target.value)} /></div>
        <div><label className="label">Bot Score (0-1)</label><input className="input text-sm" type="number" step="0.01" max="1" value={form.botScore} onChange={e=>set('botScore',parseFloat(e.target.value))} /></div>
        <div className="col-span-2"><button type="submit" disabled={saving} className="btn-primary text-sm" style={{background:'#fbbf24',color:'#0a0a0a'}}>{saving?'Saving...':<><Check size={12}/>Save</>}</button></div>
      </form>
    </div>
  )
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Influencers</h1><p className="text-sm mt-1" style={{color:'#555'}}>{influencers.length} total</p></div>
        <button onClick={()=>{setShowAdd(true);setEditing(null);setForm(E)}} className="btn-primary text-sm" style={{background:'#fbbf24',color:'#0a0a0a'}}><Plus size={13}/>Add Influencer</button>
      </div>
      {showAdd&&<FormPanel onSubmit={handleAdd} title="Add New Influencer"/>}
      {editing&&<FormPanel onSubmit={handleUpdate} title={`Edit: @${editing.displayName}`}/>}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr style={{borderBottom:'1px solid #1a1a1a'}}>{['Influencer','Niche','Market','Followers','Engagement','Bot Score','Priority','Actions'].map(h=><th key={h} className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{color:'#444'}}>{h}</th>)}</tr></thead>
          <tbody>
            {influencers.map(inf=>(
              <tr key={inf.id} className="table-row">
                <td className="px-4 py-3"><p className="text-sm font-medium" style={{color:'#ccc'}}>@{inf.displayName}</p><p className="text-xs" style={{color:'#444'}}>{inf.email}</p></td>
                <td className="px-4 py-3 text-sm" style={{color:'#888'}}>{inf.niche?.nicheName||'—'}</td>
                <td className="px-4 py-3 text-sm" style={{color:'#888'}}>{inf.market?.marketName||'—'}</td>
                <td className="px-4 py-3 text-sm" style={{color:'#ccc'}}>{inf.followerCount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm" style={{color:'#ccc'}}>{inf.engagementRate}%</td>
                <td className="px-4 py-3"><BotBadge score={inf.botScore}/></td>
                <td className="px-4 py-3"><span className={inf.refreshPriority==='High'?'badge-amber':'badge-blue'}>{inf.refreshPriority}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>startEdit(inf)} style={{color:'#444'}} className="hover:text-amber-400 transition-colors"><Edit2 size={13}/></button>
                    <button onClick={()=>handleRefresh(inf.id)} style={{color:'#444'}} className="hover:text-teal-400 transition-colors"><RefreshCw size={13}/></button>
                    <button onClick={()=>handleDelete(inf.id)} style={{color:'#444'}} className="hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {influencers.length===0&&<div className="text-center py-10 text-sm" style={{color:'#444'}}>No influencers yet.</div>}
      </div>
    </div>
  )
}
