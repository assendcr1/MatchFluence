import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import ScoreBar from '../../components/ScoreBar'
import BotBadge from '../../components/BotBadge'
import { ChevronRight, ChevronLeft, Search, Send } from 'lucide-react'
const STEPS = ['Brief','Audience','Results']
export default function BrandNewCampaign() {
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState({})
  const [form, setForm] = useState({ campaignTitle:'', campaignDescription:'', targetPlatform:'Instagram', contentType:'', nicheId:null, marketId:null, minimumFollowers:10000, maximumFollowers:500000, audienceAgeMin:18, audienceAgeMax:35, audienceGender:'Any', minEngagementRate:1.0, maxBotScore:0.3 })
  useEffect(()=>{ api.getNiches().then(r=>setNiches(r.data)); api.getMarkets().then(r=>setMarkets(r.data)) },[])
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const handleMatch = async () => {
    setLoading(true)
    try { const res = await api.runMatch(session.apiKey,form); setResults(res.data); setStep(2) }
    catch(err){ alert(err.response?.data||'Match failed. Check your filters.') }
    finally { setLoading(false) }
  }
  const handleSend = async (influencerId) => {
    setSending(p=>({...p,[influencerId]:true}))
    try { await api.sendMessage({campaignId:'00000000-0000-0000-0000-000000000000',influencerId,messageType:'Email'}); setSending(p=>({...p,[influencerId]:'sent'})) }
    catch { setSending(p=>({...p,[influencerId]:'failed'})) }
  }
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>New Campaign</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Find the best influencers for your brief</p>
      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((s,i)=>(
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{background:i<=step?'#60a5fa':'#1a1a1a',color:i<=step?'#0a0a0a':'#555'}}>{i+1}</div>
            <span className="text-sm" style={{color:i===step?'#60a5fa':'#444'}}>{s}</span>
            {i<STEPS.length-1&&<div className="w-6 h-px mx-1" style={{background:'#1a1a1a'}}/>}
          </div>
        ))}
      </div>
      {step===0&&(
        <div className="max-w-xl space-y-4">
          <div><label className="label">Campaign Title</label><input className="input" placeholder="Summer Fitness Launch" value={form.campaignTitle} onChange={e=>set('campaignTitle',e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} placeholder="Tell us what this campaign is about..." value={form.campaignDescription} onChange={e=>set('campaignDescription',e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Platform</label><select className="input" value={form.targetPlatform} onChange={e=>set('targetPlatform',e.target.value)}>{['Instagram','TikTok','YouTube','Twitter'].map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label className="label">Content Type</label><input className="input" placeholder="Reels, Posts..." value={form.contentType} onChange={e=>set('contentType',e.target.value)} /></div>
          </div>
          <button onClick={()=>setStep(1)} disabled={!form.campaignTitle||!form.campaignDescription} className="btn-primary" style={{background:'#60a5fa',color:'#0a0a0a'}}>Next <ChevronRight size={14}/></button>
        </div>
      )}
      {step===1&&(
        <div className="max-w-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Niche</label><select className="input" value={form.nicheId||''} onChange={e=>set('nicheId',e.target.value?parseInt(e.target.value):null)}><option value="">Any niche</option>{niches.map(n=><option key={n.id} value={n.id}>{n.nicheName}</option>)}</select></div>
            <div><label className="label">Market</label><select className="input" value={form.marketId||''} onChange={e=>set('marketId',e.target.value?parseInt(e.target.value):null)}><option value="">Any market</option>{markets.map(m=><option key={m.id} value={m.id}>{m.marketName}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Min Followers</label><input className="input" type="number" value={form.minimumFollowers} onChange={e=>set('minimumFollowers',parseInt(e.target.value))} /></div>
            <div><label className="label">Max Followers</label><input className="input" type="number" value={form.maximumFollowers} onChange={e=>set('maximumFollowers',parseInt(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Min Engagement %</label><input className="input" type="number" step="0.5" value={form.minEngagementRate} onChange={e=>set('minEngagementRate',parseFloat(e.target.value))} /></div>
            <div><label className="label">Max Bot Score</label><input className="input" type="number" step="0.05" max="1" value={form.maxBotScore} onChange={e=>set('maxBotScore',parseFloat(e.target.value))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setStep(0)} className="btn-secondary"><ChevronLeft size={14}/>Back</button>
            <button onClick={handleMatch} disabled={loading} className="btn-primary" style={{background:'#60a5fa',color:'#0a0a0a'}}>
              {loading?<><span className="spinner"/>Matching...</>:<><Search size={14}/>Find Matches</>}
            </button>
          </div>
        </div>
      )}
      {step===2&&results&&(
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{color:'#888'}}>{results.message}</p>
            <button onClick={()=>setStep(0)} className="btn-secondary text-sm"><ChevronLeft size={13}/>New Search</button>
          </div>
          <div className="space-y-4">
            {results.matches?.map((m,i)=>(
              <div key={m.influencerId} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{background:'rgba(96,165,250,0.1)',color:'#60a5fa'}}>#{i+1}</div>
                    <div><p className="font-semibold" style={{color:'#ccc'}}>{m.displayName}</p><p className="text-xs mt-0.5" style={{color:'#444'}}>{m.nicheName} · {m.marketName}</p></div>
                  </div>
                  <BotBadge score={m.botScore} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div><p className="text-xs mb-0.5" style={{color:'#444'}}>Followers</p><p className="font-semibold" style={{color:'#ccc'}}>{m.followerCount?.toLocaleString()}</p></div>
                  <div><p className="text-xs mb-0.5" style={{color:'#444'}}>Engagement</p><p className="font-semibold" style={{color:'#ccc'}}>{m.engagementRate}%</p></div>
                  <div><p className="text-xs mb-0.5" style={{color:'#444'}}>Handle</p><p className="font-semibold" style={{color:'#ccc'}}>{m.instagramHandle||'—'}</p></div>
                </div>
                <ScoreBar score={m.matchScore} color="#60a5fa" />
                {m.matchReason&&<p className="text-xs mt-3 leading-relaxed" style={{color:'#666'}}>{m.matchReason}</p>}
                {m.redFlags?.length>0&&<div className="mt-2">{m.redFlags.map((f,j)=><p key={j} className="text-xs" style={{color:'#fbbf24'}}>⚠ {f}</p>)}</div>}
                <div className="mt-4">
                  <button onClick={()=>handleSend(m.influencerId)} disabled={!!sending[m.influencerId]} className="btn-primary text-sm" style={{background:sending[m.influencerId]==='sent'?'#4ade80':'#60a5fa',color:'#0a0a0a'}}>
                    <Send size={12}/>{sending[m.influencerId]==='sent'?'Sent!':sending[m.influencerId]?'Sending...':'Send Outreach'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
