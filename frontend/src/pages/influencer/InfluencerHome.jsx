import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import StatCard from '../../components/StatCard'
import Loader from '../../components/Loader'
import BotBadge from '../../components/BotBadge'
import { Users, TrendingUp, Megaphone, Star, RefreshCw } from 'lucide-react'
export default function InfluencerHome() {
  const { session } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const load = async () => {
    try { const res = await api.getInfluencerSummary(session.id); setSummary(res.data) }
    catch { setSummary(null) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const handleRefresh = async () => {
    setRefreshing(true)
    try { await api.refreshOne(session.id); await load() } catch {} finally { setRefreshing(false) }
  }
  if (loading) return <Loader />
  return (
    <div className="p-7 page-fade">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Welcome back, @{session.displayName}</h1>
          <p className="text-sm mt-1" style={{color:'#555'}}>Here's how your profile is performing</p>
        </div>
        <div className="flex items-center gap-2">
          {summary?.accountConnected ? <span className="badge-teal">● Connected</span> : <span className="badge-amber">○ Not connected</span>}
          <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary text-sm">
            <RefreshCw size={13} className={refreshing?'animate-spin':''} />Refresh
          </button>
        </div>
      </div>
      {!summary?.accountConnected && (
        <div className="mb-5 p-4 rounded-xl flex items-center justify-between" style={{background:'rgba(45,212,191,0.05)',border:'1px solid rgba(45,212,191,0.15)'}}>
          <div><p className="font-semibold text-sm" style={{color:'#2dd4bf'}}>Connect your Instagram for richer data</p><p className="text-xs mt-0.5" style={{color:'#555'}}>Unlock audience demographics, real reach, and story metrics</p></div>
          <a href="/influencer/connect" className="btn-primary text-sm" style={{background:'#2dd4bf'}}>Connect →</a>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Followers" value={summary?.metrics?.followerCount?.toLocaleString()||'—'} icon={Users} accent="#2dd4bf" />
        <StatCard label="Engagement" value={summary?`${summary.metrics.engagementRate}%`:'—'} icon={TrendingUp} accent="#2dd4bf" />
        <StatCard label="Campaigns" value={summary?.campaignStats?.totalMatched||0} icon={Megaphone} accent="#2dd4bf" />
        <StatCard label="Avg Match Score" value={summary?`${summary.campaignStats.averageMatchScore}/100`:'—'} icon={Star} accent="#2dd4bf" />
      </div>
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="label mb-3">Profile Details</p>
            <div className="space-y-2">
              {[['Niche',summary.niche||'Not set'],['Market',summary.market||'Not set'],['Platform',summary.platform||'Not set'],['Instagram',summary.handles?.instagram||'—'],['Last refreshed',summary.metrics?.lastRefreshed?new Date(summary.metrics.lastRefreshed).toLocaleDateString():'—']].map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm"><span style={{color:'#555'}}>{k}</span><span style={{color:'#ccc'}}>{v}</span></div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="label mb-3">Audience Quality</p>
            <div className="flex items-center gap-3 mb-3"><BotBadge score={summary.metrics.botScore/100} /><span className="text-sm" style={{color:'#555'}}>{summary.metrics.botScore}% suspected inauthentic</span></div>
            <div className="score-bar h-2 mb-1"><div className="score-fill h-2" style={{width:`${100-summary.metrics.botScore}%`,background:'#2dd4bf'}} /></div>
            <p className="text-xs" style={{color:'#444'}}>{100-summary.metrics.botScore}% authentic audience</p>
          </div>
        </div>
      )}
    </div>
  )
}
