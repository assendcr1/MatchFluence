import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import { FileText, Download } from 'lucide-react'
export default function AgencyReports() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ api.getAgencyCampaigns(session.apiKey).then(r=>setCampaigns(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)) },[])
  const generate = (c) => {
    const lines = [`MATCHFLUENCE — CAMPAIGN REPORT`,`Generated: ${new Date().toLocaleDateString()}`,`Agency: ${session.name}`,``,`CAMPAIGN: ${c.title}`,`Platform: ${c.targetPlatform}`,``,'MATCHED INFLUENCERS',...(c.matchedInfluencers||[]).map((mi,i)=>`${i+1}. @${mi.influencer?.displayName||'Unknown'} — Score: ${mi.matchScore}/100\n   ${mi.matchReason||'No reasoning available.'}`)]
    const blob = new Blob([lines.join('\n')],{type:'text/plain'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${c.title}-report.txt`; a.click()
  }
  if(loading)return <Loader />
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Reports</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Export campaign reports for your clients</p>
      {campaigns.length===0?<div className="card p-12 text-center"><FileText size={24} style={{color:'#333',margin:'0 auto 8px'}}/><p className="text-sm" style={{color:'#555'}}>No campaigns to report on yet.</p></div>:(
        <div className="space-y-3">
          {campaigns.map(c=>(
            <div key={c.id} className="card p-5 flex items-center justify-between">
              <div><p className="font-semibold" style={{color:'#ccc'}}>{c.title}</p><p className="text-sm mt-0.5" style={{color:'#555'}}>{c.targetPlatform} · {c.matchedInfluencers?.length||0} matched</p></div>
              <button onClick={()=>generate(c)} className="btn-secondary text-sm"><Download size={12}/>Export</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
