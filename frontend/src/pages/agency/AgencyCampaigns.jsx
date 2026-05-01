import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import { Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
export default function AgencyCampaigns() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(()=>{ api.getAgencyCampaigns(session.apiKey).then(r=>setCampaigns(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)) },[])
  if(loading)return <Loader />
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-7">
        <div><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Campaigns</h1><p className="text-sm mt-1" style={{color:'#555'}}>All agency campaigns</p></div>
        <button onClick={()=>navigate('/agency')} className="btn-primary text-sm" style={{background:'#c084fc',color:'#0a0a0a'}}>+ New Campaign</button>
      </div>
      {campaigns.length===0?<EmptyState icon={Megaphone} title="No campaigns yet" sub="Use the Intelligence tab to run your first match." action={<button onClick={()=>navigate('/agency')} className="btn-primary" style={{background:'#c084fc',color:'#0a0a0a'}}>Go to Intelligence</button>}/>:(
        <div className="space-y-3">
          {campaigns.map(c=>(
            <div key={c.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold" style={{color:'#ccc'}}>{c.title}</p><p className="text-sm mt-0.5" style={{color:'#555'}}>{c.targetPlatform}</p></div>
                <span className="text-xs" style={{color:'#c084fc'}}>{c.matchedInfluencers?.length||0} matches</span>
              </div>
              {c.matchedInfluencers?.length>0&&(
                <div className="mt-3 pt-3 flex gap-2 flex-wrap" style={{borderTop:'1px solid #1a1a1a'}}>
                  {c.matchedInfluencers.slice(0,5).map(mi=><span key={mi.influencerId} className="text-xs px-2 py-0.5 rounded" style={{background:'rgba(192,132,252,0.1)',color:'#c084fc'}}>{mi.influencer?.displayName} · {mi.matchScore}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
