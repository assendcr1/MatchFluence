import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import ScoreBar from '../../components/ScoreBar'
import BotBadge from '../../components/BotBadge'
import { ChevronRight, ChevronLeft, Search, Send, Save, Download, RefreshCw, Expand } from 'lucide-react'

const STEPS = ['Brief','Audience','Results']

export default function BrandNewCampaign() {
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState({})
  const [expandedNotice, setExpandedNotice] = useState(null)
  const resultsRef = useRef(null)
  const [form, setForm] = useState({
    campaignTitle:'', campaignDescription:'', targetPlatform:'Instagram',
    contentType:'', nicheId:null, marketId:null, minimumFollowers:10000,
    maximumFollowers:500000, audienceAgeMin:18, audienceAgeMax:35,
    audienceGender:'Any', minEngagementRate:1.0, maxBotScore:0.3
  })

  useEffect(()=>{
    api.getNiches().then(r=>setNiches(r.data))
    api.getMarkets().then(r=>setMarkets(r.data))
  },[])

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const handleMatch = async () => {
    setLoading(true)
    setSaved(false)
    try {
      const res = await api.runMatch(session.token, form)
      setResults(res.data)
      setStep(2)
    }
    catch(err){ alert(err.response?.data||'Match failed. Check your filters.') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.saveCampaign(session.token, {
        title: form.campaignTitle,
        description: form.campaignDescription,
        targetPlatform: form.targetPlatform,
        audienceAgeMin: form.audienceAgeMin || 0,
        audienceAgeMax: form.audienceAgeMax || 0,
        audienceGender: form.audienceGender || 'Any',
        contentType: form.contentType || '',
        minimumFollowers: form.minimumFollowers || 0,
        maximumFollowers: form.maximumFollowers || 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      })
      setSaved(true)
    }
    catch(err){ alert(err.response?.data || 'Failed to save campaign.') }
    finally { setSaving(false) }
  }

  const handleRegenerate = async () => {
    setLoading(true)
    setSaved(false)
    setExpandedNotice(null)
    try {
      const wider = {
        ...form,
        minimumFollowers: Math.round(form.minimumFollowers * 0.5),
        maximumFollowers: Math.round(form.maximumFollowers * 1.5),
        minEngagementRate: Math.max(0.5, (form.minEngagementRate || 1) * 0.5),
        nicheId: null  // remove niche restriction
      }
      const res = await api.runMatch(session.token, wider)
      setResults(res.data)
      if (res.data.expanded) setExpandedNotice(res.data.expandedNiches)
    }
    catch(err){ alert(err.response?.data || 'Match failed.') }
    finally { setLoading(false) }
  }

  const handleExportPDF = () => {
    const matches = results?.matches || []
    const niche = niches.find(n => n.id === form.nicheId)?.nicheName || 'Any'
    const market = markets.find(m => m.id === form.marketId)?.marketName || 'Any'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${form.campaignTitle} — MatchFluence Report</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
          .meta-item label { font-size: 11px; color: #888; text-transform: uppercase; display: block; margin-bottom: 2px; }
          .meta-item span { font-size: 14px; font-weight: 600; }
          .influencer { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
          .inf-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
          .inf-name { font-size: 16px; font-weight: 700; }
          .inf-handle { font-size: 12px; color: #888; margin-top: 2px; }
          .inf-score { font-size: 22px; font-weight: 800; color: #2563eb; }
          .inf-score span { font-size: 12px; color: #888; }
          .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 12px 0; }
          .stat label { font-size: 11px; color: #888; text-transform: uppercase; display: block; }
          .stat span { font-size: 14px; font-weight: 600; }
          .reason { font-size: 13px; color: #444; line-height: 1.6; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
          .flag { font-size: 12px; color: #d97706; margin-top: 4px; }
          .rank { display: inline-block; width: 28px; height: 28px; border-radius: 50%; background: #2563eb; color: white; text-align: center; line-height: 28px; font-size: 13px; font-weight: 700; margin-right: 8px; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <h1>${form.campaignTitle}</h1>
        <p class="subtitle">MatchFluence Campaign Report · Generated ${new Date().toLocaleDateString('en-ZA', {day:'numeric',month:'long',year:'numeric'})}</p>
        <div class="meta">
          <div class="meta-item"><label>Platform</label><span>${form.targetPlatform}</span></div>
          <div class="meta-item"><label>Niche</label><span>${niche}</span></div>
          <div class="meta-item"><label>Market</label><span>${market}</span></div>
          <div class="meta-item"><label>Min Followers</label><span>${form.minimumFollowers.toLocaleString()}</span></div>
          <div class="meta-item"><label>Max Followers</label><span>${form.maximumFollowers.toLocaleString()}</span></div>
          <div class="meta-item"><label>Min Engagement</label><span>${form.minEngagementRate}%</span></div>
        </div>
        <h2 style="font-size:16px;margin-bottom:16px;">Top ${matches.length} Matched Influencers</h2>
        ${matches.map((m, i) => `
          <div class="influencer">
            <div class="inf-header">
              <div>
                <div class="inf-name"><span class="rank">${i+1}</span>${m.displayName}</div>
                <div class="inf-handle">${m.instagramHandle || ''} · ${m.nicheName || ''} · ${m.marketName || ''}</div>
              </div>
              <div class="inf-score">${m.matchScore}<span>/100</span></div>
            </div>
            <div class="stats">
              <div class="stat"><label>Followers</label><span>${m.followerCount?.toLocaleString()}</span></div>
              <div class="stat"><label>Engagement</label><span>${m.engagementRate}%</span></div>
              <div class="stat"><label>Bot Score</label><span>${(m.botScore * 100).toFixed(0)}% bots</span></div>
            </div>
            ${m.matchReason ? `<div class="reason">${m.matchReason}</div>` : ''}
            ${m.redFlags?.map(f => `<div class="flag">⚠ ${f}</div>`).join('') || ''}
          </div>
        `).join('')}
        <div class="footer">
          <span>MatchFluence · The Ablant Co.</span>
          <span>${form.campaignTitle} · ${new Date().toLocaleDateString()}</span>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    setTimeout(() => { win?.print(); URL.revokeObjectURL(url) }, 800)
  }

  const handleSend = async (influencerId) => {
    setSending(p=>({...p,[influencerId]:true}))
    try {
      await api.sendMessage({ campaignId:'00000000-0000-0000-0000-000000000000', influencerId, messageType:'Email' })
      setSending(p=>({...p,[influencerId]:'sent'}))
    }
    catch { setSending(p=>({...p,[influencerId]:'failed'})) }
  }

  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>New Campaign</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Find the best influencers for your brief</p>

      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((s,i)=>(
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{background:i<=step?'#60a5fa':'#1a1a1a',color:i<=step?'#0a0a0a':'#555'}}>{i+1}</div>
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

      {/* Expansion notice popup */}
      {expandedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)'}}>
          <div className="card p-8 max-w-md w-full mx-4" style={{border:'1px solid rgba(251,191,36,0.3)'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)'}}>
                <span style={{fontSize:'18px'}}>⚡</span>
              </div>
              <div>
                <p className="font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Search Expanded</p>
                <p className="text-xs mt-0.5" style={{color:'#555'}}>Not enough exact matches found</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{color:'#888'}}>
              We couldn't find enough influencers in your selected niche, so we expanded the search to include closely related niches: <span style={{color:'#fbbf24', fontWeight:600}}>{expandedNotice.join(', ')}</span>. These influencers share a similar audience and content style.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setExpandedNotice(null)} className="btn-primary flex-1 justify-center" style={{background:'#fbbf24', color:'#0a0a0a'}}>
                Got it, show results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expansion notice popup */}
      {expandedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)'}}>
          <div className="card p-8 max-w-md w-full mx-4" style={{border:'1px solid rgba(251,191,36,0.3)'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)'}}>
                <span style={{fontSize:'18px'}}>⚡</span>
              </div>
              <div>
                <p className="font-bold text-white" style={{fontFamily:'Syne,sans-serif'}}>Search Expanded</p>
                <p className="text-xs mt-0.5" style={{color:'#555'}}>Not enough exact matches found</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{color:'#888'}}>
              We couldn't find enough influencers in your selected niche, so we expanded the search to include closely related niches: <span style={{color:'#fbbf24', fontWeight:600}}>{expandedNotice.join(', ')}</span>. These influencers share a similar audience and content style.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setExpandedNotice(null)} className="btn-primary flex-1 justify-center" style={{background:'#fbbf24', color:'#0a0a0a'}}>
                Got it, show results
              </button>
            </div>
          </div>
        </div>
      )}

      {step===2&&results&&(
        <div className="max-w-2xl" ref={resultsRef}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{color:'#888'}}>{results.message}</p>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="btn-secondary text-sm flex items-center gap-1.5">
                <Download size={13}/>Export PDF
              </button>
              <button
                onClick={handleSave}
                disabled={saving||saved}
                className="btn-primary text-sm flex items-center gap-1.5"
                style={{background:saved?'#4ade80':'#60a5fa',color:'#0a0a0a'}}
              >
                <Save size={13}/>{saved?'Saved!':saving?'Saving...':'Save Campaign'}
              </button>
              <button onClick={handleRegenerate} disabled={loading} className="btn-secondary text-sm flex items-center gap-1.5">
                <RefreshCw size={12}/>{loading ? 'Searching...' : 'Widen Search'}
              </button>
              <button onClick={()=>{ setStep(0); setSaved(false); setExpandedNotice(null) }} className="btn-secondary text-sm"><ChevronLeft size={13}/>New Search</button>
            </div>
          </div>

          <div className="space-y-4">
            {results.matches?.map((m,i)=>(
              <div key={m.influencerId} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{background:'rgba(96,165,250,0.1)',color:'#60a5fa'}}>#{i+1}</div>
                    <div>
                      <p className="font-semibold" style={{color:'#ccc'}}>{m.displayName}</p>
                      <p className="text-xs mt-0.5" style={{color:'#444'}}>{m.nicheName} · {m.marketName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.isExpandedResult && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(251,191,36,0.1)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.2)'}}>Related niche</span>
                    )}
                    <BotBadge score={m.botScore} />
                  </div>
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
                  <button onClick={()=>handleSend(m.influencerId)} disabled={!!sending[m.influencerId]} className="btn-primary text-sm"
                    style={{background:sending[m.influencerId]==='sent'?'#4ade80':'#60a5fa',color:'#0a0a0a'}}>
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
