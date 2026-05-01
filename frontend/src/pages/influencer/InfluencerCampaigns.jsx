import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import { Megaphone } from 'lucide-react'
const sb = (s) => ({Matched:'badge-blue',Contacted:'badge-amber',Accepted:'badge-green',Rejected:'badge-red'})[s]||'badge-blue'
export default function InfluencerCampaigns() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.getInfluencerCampaigns(session.id).then(r=>setCampaigns(r.data.campaigns||[])).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  if (loading) return <Loader />
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Campaigns</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>All campaigns you've been matched to</p>
      {campaigns.length === 0 ? <EmptyState icon={Megaphone} title="No campaigns yet" sub="You'll appear here when brands match you to their campaigns." /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr style={{borderBottom:'1px solid #1a1a1a'}}>{['Campaign','Platform','Score','Status','Matched'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{color:'#444'}}>{h}</th>)}</tr></thead>
            <tbody>
              {campaigns.map(c=>(
                <tr key={c.campaignId} className="table-row">
                  <td className="px-4 py-3"><p className="text-sm font-medium" style={{color:'#ccc'}}>{c.campaignTitle}</p><p className="text-xs mt-0.5" style={{color:'#444'}}>{c.niche} · {c.market}</p></td>
                  <td className="px-4 py-3 text-sm" style={{color:'#888'}}>{c.targetPlatform}</td>
                  <td className="px-4 py-3"><span className="font-bold" style={{color:'#2dd4bf'}}>{c.matchScore}</span><span className="text-xs" style={{color:'#444'}}>/100</span></td>
                  <td className="px-4 py-3"><span className={sb(c.status)}>{c.status}</span></td>
                  <td className="px-4 py-3 text-sm" style={{color:'#555'}}>{new Date(c.matchedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
