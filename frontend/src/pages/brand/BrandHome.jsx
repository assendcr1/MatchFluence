import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import StatCard from '../../components/StatCard'
import { Megaphone, Users, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export default function BrandHome() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const navigate = useNavigate()
  useEffect(()=>{ api.getBrandCampaigns(session.apiKey).then(r=>setCampaigns(r.data||[])).catch(()=>{}) },[])
  const active = campaigns.filter(c=>new Date(c.endDate)>=new Date()).length
  return (
    <div className="p-7 page-fade">
      <div className="flex items-start justify-between mb-7">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Welcome, {session.name}</h1><p className="text-sm mt-1" style={{color:'#555'}}>Find the right influencers for your campaigns</p></div>
        <button onClick={()=>navigate('/brand/new-campaign')} className="btn-primary" style={{background:'#60a5fa',color:'#0a0a0a'}}><PlusCircle size={14}/>New Campaign</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Campaigns" value={campaigns.length} icon={Megaphone} accent="#60a5fa" />
        <StatCard label="Active Campaigns" value={active} icon={Megaphone} accent="#4ade80" />
        <StatCard label="Total Matches" value={campaigns.reduce((a,c)=>a+(c.matchedInfluencers?.length||0),0)} icon={Users} accent="#60a5fa" />
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4"><p className="font-semibold text-white" style={{fontFamily:'Syne,sans-serif'}}>Recent Campaigns</p><button onClick={()=>navigate('/brand/campaigns')} className="text-sm" style={{color:'#60a5fa'}}>View all</button></div>
        {campaigns.length===0 ? (
          <div className="text-center py-8"><p className="text-sm mb-4" style={{color:'#555'}}>No campaigns yet.</p><button onClick={()=>navigate('/brand/new-campaign')} className="btn-primary text-sm" style={{background:'#60a5fa',color:'#0a0a0a'}}><PlusCircle size={13}/>Create Campaign</button></div>
        ) : campaigns.slice(0,3).map(c=>(
          <div key={c.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{borderColor:'#1a1a1a'}}>
            <div><p className="text-sm font-medium" style={{color:'#ccc'}}>{c.title}</p><p className="text-xs mt-0.5" style={{color:'#444'}}>{c.targetPlatform}</p></div>
            <span className="text-xs" style={{color:'#60a5fa'}}>{c.matchedInfluencers?.length||0} matches</span>
          </div>
        ))}
      </div>
    </div>
  )
}
