import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import ScoreBar from '../../components/ScoreBar'
import BotBadge from '../../components/BotBadge'
import { Brain, Search } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
export default function AgencyIntelligence() {
  const { session } = useAuth()
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ campaignTitle:'', campaignDescription:'', targetPlatform:'Instagram', nicheId:null, marketId:null, minimumFollowers:5000, maximumFollowers:1000000, minEngagementRate:0.5, maxBotScore:0.5 })
  useEffect(()=>{ api.getNiches().then(r=>setNiches(r.data)); api.getMarkets().then(r=>setMarkets(r.data)) },[])
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleMatch = async () => {
    setLoading(true)
    try { const res = await api.runMatch(session.apiKey,form); setResults(res.data); setSelected(res.data.matches?.[0]||null) }
    catch(err){ alert(err.response?.data||'Match failed.') }
    finally { setLoading(false) }
  }
  const radar = selected ? [
    {axis:'Niche',value:selected.scoreBreakdown.nicheScore,full:30},
    {axis:'Followers',value:selected.scoreBreakdown.followerScore,full:20},
    {axis:'Engagement',value:selected.scoreBreakdown.engagementScore,full:25},
    {axis:'Authenticity',value:selected.scoreBreakdown.botScore,full:15},
    {axis:'Platform',value:selected.scoreBreakdown.platformScore,full:10},
  ] : []
  return (
    <div className="p-7 page-fade">
      <div className="flex items-center gap-2 mb-1"><Brain size={18} style={{color:'#c084fc'}}/><h1 className="text-xl font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Intelligence Layer</h1></div>
      <p className="text-sm mb-7" style={{color:'#555'}}>Deep analysis and strategic insights for your campaigns</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-3">
          <div className="card p-5">
            <p className="label mb-3">Campaign Brief</p>
            <div className="space-y-3">
              <div><label className="label">Title</label><input className="input text-sm" placeholder="Campaign name" value={form.campaignTitle} onChange={e=>set('campaignTitle',e.target.value)} /></div>
              <div><label className="label">Description</label><textarea className="input text-sm" rows={2} value={form.campaignDescription} onChange={e=>set('campaignDescription',e.target.value)} /></div>
              <div><label className="label">Platform</label><select className="input text-sm" value={form.targetPlatform} onChange={e=>set('targetPlatform',e.target.value)}>{['Instagram','TikTok','YouTube','Twitter'].map(p=><option key={p}>{p}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">Niche</label><select className="input text-sm" value={form.nicheId||''} onChange={e=>set('nicheId',e.target.value?parseInt(e.target.value):null)}><option value="">Any</option>{niches.map(n=><option key={n.id} value={n.id}>{n.nicheName}</option>)}</select></div>
                <div><label className="label">Market</label><select className="input text-sm" value={form.marketId||''} onChange={e=>set('marketId',e.target.value?parseInt(e.target.value):null)}><option value="">Any</option>{markets.map(m=><option key={m.id} value={m.id}>{m.marketName}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label">Min Followers</label><input className="input text-sm" type="number" value={form.minimumFollowers} onChange={e=>set('minimumFollowers',parseInt(e.target.value))} /></div>
                <div><label className="label">Max Followers</label><input className="input text-sm" type="number" value={form.maximumFollowers} onChange={e=>set('maximumFollowers',parseInt(e.target.value))} /></div>
              </div>
              <button onClick={handleMatch} disabled={loading||!form.campaignTitle} className="btn-primary w-full justify-center text-sm" style={{background:'#c084fc',color:'#0a0a0a'}}>
                {loading?<><span className="spinner"/>Analysing...</>:<><Search size={13}/>Run Intelligence Match</>}
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {results?(
            <>
              <p className="text-xs mb-2" style={{color:'#555'}}>{results.message}</p>
              {results.matches?.map((m,i)=>(
                <button key={m.influencerId} onClick={()=>setSelected(m)} className={`card p-4 w-full text-left card-hover ${selected?.influencerId===m.influencerId?'border-purple-400/30':''}`} style={selected?.influencerId===m.influencerId?{borderColor:'rgba(192,132,252,0.3)'}:{}}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'rgba(192,132,252,0.1)',color:'#c084fc'}}>#{i+1}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate" style={{color:'#ccc'}}>{m.displayName}</p><p className="text-xs" style={{color:'#444'}}>{m.nicheName} · {m.followerCount?.toLocaleString()}</p></div>
                    <span className="font-bold text-sm" style={{color:'#c084fc'}}>{m.matchScore}</span>
                  </div>
                  <ScoreBar score={m.matchScore} color="#c084fc" />
                </button>
              ))}
            </>
          ):(
            <div className="card p-8 text-center"><Brain size={24} style={{color:'#333',margin:'0 auto 8px'}}/><p className="text-sm" style={{color:'#555'}}>Run a match to see results</p></div>
          )}
        </div>
        <div className="space-y-3">
          {selected?(
            <>
              <div className="card p-5">
                <p className="label mb-2">Score Breakdown</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="#1a1a1a" />
                    <PolarAngleAxis dataKey="axis" tick={{fill:'#555',fontSize:10}} />
                    <Radar dataKey="value" stroke="#c084fc" fill="#c084fc" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-1 space-y-1">{radar.map(d=><div key={d.axis} className="flex justify-between text-xs"><span style={{color:'#555'}}>{d.axis}</span><span className="font-semibold" style={{color:'#c084fc'}}>{d.value}/{d.full}</span></div>)}</div>
              </div>
              <div className="card p-4"><p className="label mb-2">Authenticity</p><BotBadge score={selected.botScore}/><p className="text-xs mt-2 leading-relaxed" style={{color:'#555'}}>{selected.botScore<=0.05?'Highly authentic — low risk.':selected.botScore<=0.15?'Mostly authentic — acceptable.':'Elevated signals — review carefully.'}</p></div>
              <div className="card p-4"><p className="label mb-2">AI Insight</p><p className="text-xs leading-relaxed" style={{color:'#888'}}>{selected.matchReason||'No AI reasoning available.'}</p></div>
              {selected.redFlags?.length>0&&<div className="card p-4" style={{borderColor:'rgba(251,191,36,0.2)'}}><p className="label mb-1" style={{color:'#fbbf24'}}>Red Flags</p>{selected.redFlags.map((f,i)=><p key={i} className="text-xs" style={{color:'#fbbf24'}}>⚠ {f}</p>)}</div>}
              <div className="card p-4"><p className="label mb-2">ROI Estimate</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span style={{color:'#555'}}>Est. Reach</span><span style={{color:'#ccc'}}>{Math.round(selected.followerCount*(selected.engagementRate/100)*8).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span style={{color:'#555'}}>Est. Engagements</span><span style={{color:'#ccc'}}>{Math.round(selected.followerCount*(selected.engagementRate/100)).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span style={{color:'#555'}}>Authenticity Factor</span><span style={{color:'#4ade80'}}>{((1-selected.botScore)*100).toFixed(0)}%</span></div>
                </div>
              </div>
            </>
          ):(
            <div className="card p-8 text-center"><p className="text-sm" style={{color:'#555'}}>Select a match for deep analysis</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
