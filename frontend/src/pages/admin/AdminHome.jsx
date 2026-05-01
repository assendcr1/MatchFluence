import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import StatCard from '../../components/StatCard'
import { Users, Megaphone, Database, RefreshCw } from 'lucide-react'
export default function AdminHome() {
  const [stats, setStats] = useState({influencers:0,campaigns:0,niches:0,markets:0})
  const [refreshing, setRefreshing] = useState(false)
  useEffect(()=>{
    Promise.all([api.getInfluencers(),api.getCampaigns(),api.getNiches(),api.getMarkets()]).then(([i,c,n,m])=>setStats({influencers:i.data.length,campaigns:c.data.length,niches:n.data.length,markets:m.data.length})).catch(()=>{})
  },[])
  const handleRefresh = async () => {
    setRefreshing(true)
    try { await api.refreshAll(); alert('Refresh cycle started.') }
    catch { alert('Failed to trigger refresh.') }
    finally { setRefreshing(false) }
  }
  return (
    <div className="p-7 page-fade">
      <div className="flex items-start justify-between mb-7">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Admin Overview</h1><p className="text-sm mt-1" style={{color:'#555'}}>Platform health and management</p></div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary text-sm"><RefreshCw size={13} className={refreshing?'animate-spin':''}/>{refreshing?'Refreshing...':'Trigger Refresh'}</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        <StatCard label="Influencers" value={stats.influencers} icon={Users} accent="#fbbf24" />
        <StatCard label="Campaigns" value={stats.campaigns} icon={Megaphone} accent="#fbbf24" />
        <StatCard label="Niches" value={stats.niches} icon={Database} accent="#fbbf24" />
        <StatCard label="Markets" value={stats.markets} icon={Database} accent="#fbbf24" />
      </div>
      <div className="card p-5">
        <p className="font-semibold text-white mb-4" style={{fontFamily:'Syne,sans-serif'}}>Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          {[['Manage Influencers','/admin/influencers'],['Manage Brands','/admin/brands'],['Manage Agencies','/admin/agencies'],['Niches & Markets','/admin/niches-markets']].map(([label,path])=>(
            <a key={label} href={path} className="card p-4 text-center card-hover block"><p className="text-sm font-medium" style={{color:'#fbbf24'}}>{label}</p></a>
          ))}
        </div>
      </div>
    </div>
  )
}
