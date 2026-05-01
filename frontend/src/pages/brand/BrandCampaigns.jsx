import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import { Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export default function BrandCampaigns() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(()=>{ api.getBrandCampaigns(session.apiKey).then(r=>setCampaigns(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)) },[])
  if(loading)return <Loader />
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-7">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>My Campaigns</h1><p className="text-sm mt-1" style={{color:'#555'}}>All campaigns you've created</p></div>
        <button onClick={()=>navigate('/brand/new-campaign')} className="btn-primary text-sm" style={{background:'#60a5fa',color:'#0a0a0a'}}>+ New Campaign</button>
      </div>
      {campaigns.length===0?<EmptyState icon={Megaphone} title="No campaigns yet" sub="Create your first campaign to find matched influencers." action={<button onClick={()=>navigate('/brand/new-campaign')} className="btn-primary" style={{background:'#60a5fa',color:'#0a0a0a'}}>Create Campaign</button>}/>:(
        <div className="space-y-3">
          {campaigns.map(c=>(
            <div key={c.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold" style={{color:'#ccc'}}>{c.title}</p><p className="text-sm mt-0.5" style={{color:'#555'}}>{c.targetPlatform} · {c.description?.slice(0,60)}...</p></div>
                <p className="text-xs" style={{color:'#60a5fa'}}>{c.matchedInfluencers?.length||0} matches</p>
              </div>
              {c.matchedInfluencers?.length>0&&(
                <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{borderTop:'1px solid #1a1a1a'}}>
                  {c.matchedInfluencers.slice(0,3).map(mi=><span key={mi.influencerId} className="text-xs px-2 py-0.5 rounded" style={{background:'rgba(96,165,250,0.1)',color:'#60a5fa'}}>{mi.influencer?.displayName} · {mi.matchScore}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
