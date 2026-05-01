import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import BotBadge from '../../components/BotBadge'
import { Search, RefreshCw } from 'lucide-react'
export default function AgencyDatabase() {
  const [influencers, setInfluencers] = useState([])
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ nicheId:'', marketId:'', minFollowers:'', maxFollowers:'', minEngagement:'', maxBotScore:'' })
  const [search, setSearch] = useState('')
  useEffect(()=>{ Promise.all([api.getInfluencers(),api.getNiches(),api.getMarkets()]).then(([i,n,m])=>{setInfluencers(i.data);setNiches(n.data);setMarkets(m.data)}).finally(()=>setLoading(false)) },[])
  const setF = (k,v) => setFilters(p=>({...p,[k]:v}))
  const filtered = influencers.filter(inf=>{
    if(search&&!inf.displayName.toLowerCase().includes(search.toLowerCase()))return false
    if(filters.nicheId&&inf.nicheId!==parseInt(filters.nicheId))return false
    if(filters.marketId&&inf.marketId!==parseInt(filters.marketId))return false
    if(filters.minFollowers&&inf.followerCount<parseInt(filters.minFollowers))return false
    if(filters.maxFollowers&&inf.followerCount>parseInt(filters.maxFollowers))return false
    if(filters.minEngagement&&inf.engagementRate<parseFloat(filters.minEngagement))return false
    if(filters.maxBotScore&&inf.botScore>parseFloat(filters.maxBotScore))return false
    return true
  })
  if(loading)return <Loader />
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Influencer Database</h1><p className="text-sm mt-1" style={{color:'#555'}}>{influencers.length} influencers tracked</p></div>
        <button onClick={()=>api.refreshAll().then(()=>alert('Refresh triggered.'))} className="btn-secondary text-sm"><RefreshCw size={12}/>Refresh All</button>
      </div>
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          <div className="relative lg:col-span-2"><Search size={13} style={{position:'absolute',left:10,top:11,color:'#444'}}/><input className="input pl-7 text-sm" placeholder="Search handle..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
          <select className="input text-sm" value={filters.nicheId} onChange={e=>setF('nicheId',e.target.value)}><option value="">All niches</option>{niches.map(n=><option key={n.id} value={n.id}>{n.nicheName}</option>)}</select>
          <select className="input text-sm" value={filters.marketId} onChange={e=>setF('marketId',e.target.value)}><option value="">All markets</option>{markets.map(m=><option key={m.id} value={m.id}>{m.marketName}</option>)}</select>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <input className="input text-sm" type="number" placeholder="Min followers" value={filters.minFollowers} onChange={e=>setF('minFollowers',e.target.value)} />
          <input className="input text-sm" type="number" placeholder="Max followers" value={filters.maxFollowers} onChange={e=>setF('maxFollowers',e.target.value)} />
          <input className="input text-sm" type="number" step="0.1" placeholder="Min engagement %" value={filters.minEngagement} onChange={e=>setF('minEngagement',e.target.value)} />
          <input className="input text-sm" type="number" step="0.05" placeholder="Max bot score" value={filters.maxBotScore} onChange={e=>setF('maxBotScore',e.target.value)} />
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-2 text-xs" style={{borderBottom:'1px solid #1a1a1a',color:'#444'}}>{filtered.length} results</div>
        <table className="w-full">
          <thead><tr style={{borderBottom:'1px solid #1a1a1a'}}>{['Influencer','Niche','Market','Followers','Engagement','Bot Score','Priority','Source'].map(h=><th key={h} className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{color:'#444'}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(inf=>(
              <tr key={inf.id} className="table-row">
                <td className="px-4 py-3"><p className="text-sm font-medium" style={{color:'#ccc'}}>@{inf.displayName}</p><p className="text-xs" style={{color:'#444'}}>{inf.instagramHandle||'—'}</p></td>
                <td className="px-4 py-3 text-sm" style={{color:'#888'}}>{inf.niche?.nicheName||'—'}</td>
                <td className="px-4 py-3 text-sm" style={{color:'#888'}}>{inf.market?.marketName||'—'}</td>
                <td className="px-4 py-3 text-sm" style={{color:'#ccc'}}>{inf.followerCount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm" style={{color:'#ccc'}}>{inf.engagementRate}%</td>
                <td className="px-4 py-3"><BotBadge score={inf.botScore} /></td>
                <td className="px-4 py-3"><span className={inf.refreshPriority==='High'?'badge-purple':'badge-amber'}>{inf.refreshPriority}</span></td>
                <td className="px-4 py-3 text-xs" style={{color:'#444'}}>{inf.discoverySource||'Manual'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div className="text-center py-10 text-sm" style={{color:'#444'}}>No influencers match your filters.</div>}
      </div>
    </div>
  )
}
