import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import { Plus, Trash2 } from 'lucide-react'
export default function AdminNichesMarkets() {
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNiche, setNewNiche] = useState('')
  const [newMarket, setNewMarket] = useState('')
  const load = () => { setLoading(true); Promise.all([api.getNiches(),api.getMarkets()]).then(([n,m])=>{setNiches(n.data);setMarkets(m.data)}).finally(()=>setLoading(false)) }
  useEffect(()=>{ load() },[])
  const addNiche = async (e) => { e.preventDefault(); if(!newNiche.trim())return; try{await api.createNiche({nicheName:newNiche.trim()});setNewNiche('');load()}catch{alert('Failed. May already exist.')} }
  const addMarket = async (e) => { e.preventDefault(); if(!newMarket.trim())return; try{await api.createMarket({marketName:newMarket.trim()});setNewMarket('');load()}catch{alert('Failed. May already exist.')} }
  const delNiche = async (id) => { if(!confirm('Delete?'))return; try{await api.deleteNiche(id);load()}catch{alert('Cannot delete — influencers may be assigned.')} }
  const delMarket = async (id) => { if(!confirm('Delete?'))return; try{await api.deleteMarket(id);load()}catch{alert('Cannot delete — influencers may be assigned.')} }
  if(loading)return <Loader />
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Niches & Markets</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Manage the taxonomy used to categorise influencers and campaigns</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="font-semibold text-white mb-3" style={{fontFamily:'Syne,sans-serif'}}>Niches ({niches.length})</p>
          <form onSubmit={addNiche} className="flex gap-2 mb-3"><input className="input text-sm flex-1" placeholder="e.g. Fitness, Fashion..." value={newNiche} onChange={e=>setNewNiche(e.target.value)}/><button type="submit" className="btn-primary" style={{background:'#fbbf24',color:'#0a0a0a'}}><Plus size={13}/></button></form>
          <div className="card divide-y" style={{'--tw-divide-opacity':1}}>
            {niches.map(n=><div key={n.id} className="flex items-center justify-between px-4 py-3"><span className="text-sm" style={{color:'#ccc'}}>{n.nicheName}</span><div className="flex items-center gap-2"><span className="text-xs" style={{color:'#444'}}>#{n.id}</span><button onClick={()=>delNiche(n.id)} style={{color:'#444'}} className="hover:text-red-400 transition-colors"><Trash2 size={12}/></button></div></div>)}
            {niches.length===0&&<div className="px-4 py-8 text-center text-sm" style={{color:'#444'}}>No niches yet</div>}
          </div>
        </div>
        <div>
          <p className="font-semibold text-white mb-3" style={{fontFamily:'Syne,sans-serif'}}>Markets ({markets.length})</p>
          <form onSubmit={addMarket} className="flex gap-2 mb-3"><input className="input text-sm flex-1" placeholder="e.g. South Africa, Nigeria..." value={newMarket} onChange={e=>setNewMarket(e.target.value)}/><button type="submit" className="btn-primary" style={{background:'#fbbf24',color:'#0a0a0a'}}><Plus size={13}/></button></form>
          <div className="card divide-y">
            {markets.map(m=><div key={m.id} className="flex items-center justify-between px-4 py-3"><span className="text-sm" style={{color:'#ccc'}}>{m.marketName}</span><div className="flex items-center gap-2"><span className="text-xs" style={{color:'#444'}}>#{m.id}</span><button onClick={()=>delMarket(m.id)} style={{color:'#444'}} className="hover:text-red-400 transition-colors"><Trash2 size={12}/></button></div></div>)}
            {markets.length===0&&<div className="px-4 py-8 text-center text-sm" style={{color:'#444'}}>No markets yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
