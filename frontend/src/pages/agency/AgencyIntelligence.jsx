import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import ScoreBar from '../../components/ScoreBar'
import BotBadge from '../../components/BotBadge'
import { Brain, Search, ChevronRight, ChevronLeft, Send, Save, Download, RefreshCw, Heart } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const STEPS = ['Brief', 'Campaign Details', 'Audience']

const OBJECTIVES = [
  { value: 'brand_awareness', label: 'Brand Awareness', desc: 'Increase visibility and recognition' },
  { value: 'product_launch', label: 'Product Launch', desc: 'Introduce a new product to market' },
  { value: 'drive_sales', label: 'Drive Sales', desc: 'Generate direct conversions' },
  { value: 'app_downloads', label: 'App Downloads', desc: 'Grow app installs and users' },
  { value: 'event_promotion', label: 'Event Promotion', desc: 'Drive attendance or awareness' },
  { value: 'content_creation', label: 'Content Creation', desc: 'Generate UGC and brand content' },
]

const CONTENT_FORMATS = ['Reels', 'Stories', 'Feed Posts', 'TikTok Videos', 'YouTube Shorts', 'YouTube Videos', 'Tweets/X Posts']
const CONTENT_REQUIREMENTS = ['Must show product', 'Lifestyle integration', 'Tutorial/Demo', 'Discount code', 'Behind the scenes', 'Unboxing', 'Before & After', 'Day in the life']

export default function AgencyIntelligence() {
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [expandedNotice, setExpandedNotice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [favourites, setFavourites] = useState(new Set())

  const [form, setForm] = useState({
    campaignTitle: '', campaignDescription: '', clientName: '',
    targetPlatform: 'Instagram', objective: '',
    contentFormats: [], contentRequirements: [],
    exclusivity: false, startDate: '', endDate: '',
    nicheId: null, marketId: null,
    minimumFollowers: 5000, maximumFollowers: 1000000,
    audienceAgeMin: 18, audienceAgeMax: 35,
    audienceGender: 'Any', minEngagementRate: 0.5, maxBotScore: 0.5
  })

  useEffect(() => {
    api.getNiches().then(r => setNiches(r.data))
    api.getMarkets().then(r => setMarkets(r.data))
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleArray = (key, value) => setForm(p => {
    const arr = p[key] || []
    return { ...p, [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] }
  })
  const toggleFavourite = (id) => setFavourites(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const handleMatch = async () => {
    setLoading(true)
    try {
      const res = await api.runMatch(session.token, form)
      setResults(res.data)
      setSelected(res.data.matches?.[0] || null)
      if (res.data.expanded) setExpandedNotice(res.data.expandedNiches)
    } catch (err) { alert(err.response?.data || 'Match failed.') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const today = new Date()
      const endDate = form.endDate ? new Date(form.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const fmt = (d) => d.toISOString().split('T')[0]
      await api.saveCampaign(session.token, {
        title: `${form.campaignTitle} — ${Date.now()}`,
        description: form.campaignDescription,
        targetPlatform: form.targetPlatform || 'Instagram',
        audienceAgeMin: parseInt(form.audienceAgeMin) || 18,
        audienceAgeMax: parseInt(form.audienceAgeMax) || 35,
        audienceGender: form.audienceGender || 'Any',
        contentType: form.contentFormats?.join(', ') || '',
        minimumFollowers: parseInt(form.minimumFollowers) || 5000,
        maximumFollowers: parseInt(form.maximumFollowers) || 1000000,
        startDate: form.startDate ? fmt(new Date(form.startDate)) : fmt(today),
        endDate: fmt(endDate),
        nicheId: form.nicheId || null,
        marketId: form.marketId || null,
        createdByAgencyId: session.userType === 'Agency' ? session.id : null,
      })
      setSaved(true)
    } catch (err) { alert(err.response?.data?.message || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const handleSend = (m) => {
    const agencyName = session.name || 'An agency'
    const msg = `Hi @${m.displayName}! 👋\n\n${agencyName} would like to invite you to collaborate on the "${form.campaignTitle}" campaign${form.clientName ? ` for ${form.clientName}` : ''}.\n\nTo accept this invitation, please sign up to MatFluenca:\nhttps://matfluenca.vercel.app/influencer/login\n\nPowered by MatFluenca | A Product of The Ablant Co.`
    navigator.clipboard.writeText(msg).then(() => setCopiedId(m.influencerId))
  }

  const handleExportPDF = () => {
    const matches = results?.matches || []
    const niche = niches.find(n => n.id === form.nicheId)?.nicheName || 'Any'
    const market = markets.find(m => m.id === form.marketId)?.marketName || 'Any'
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${form.campaignTitle} — MatFluenca Agency Report</title>
    <style>body{font-family:Arial,sans-serif;color:#111;padding:40px;max-width:800px;margin:0 auto}h1{font-size:24px}h2{font-size:16px;margin:24px 0 12px}.subtitle{color:#666;font-size:14px;margin-bottom:24px}.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:32px;padding:16px;background:#f5f5f5;border-radius:8px}.meta-item label{font-size:11px;color:#888;text-transform:uppercase;display:block;margin-bottom:2px}.meta-item span{font-size:14px;font-weight:600}.influencer{border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin-bottom:16px}.inf-header{display:flex;justify-content:space-between;margin-bottom:12px}.inf-name{font-size:16px;font-weight:700}.inf-score{font-size:22px;font-weight:800;color:#7c3aed}.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}.stat label{font-size:11px;color:#888;text-transform:uppercase;display:block}.stat span{font-size:14px;font-weight:600}.reason{font-size:13px;color:#444;line-height:1.6;margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0}.fav{color:#e11d48;font-size:12px;font-weight:600}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:11px;color:#aaa;display:flex;justify-content:space-between}</style>
    </head><body>
    <h1>${form.campaignTitle}</h1>
    ${form.clientName ? `<p style="color:#666;font-size:14px">Client: ${form.clientName}</p>` : ''}
    <p class="subtitle">MatFluenca Agency Intelligence Report · ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <div class="meta">
      <div class="meta-item"><label>Platform</label><span>${form.targetPlatform}</span></div>
      <div class="meta-item"><label>Objective</label><span>${OBJECTIVES.find(o => o.value === form.objective)?.label || '—'}</span></div>
      <div class="meta-item"><label>Niche</label><span>${niche}</span></div>
      <div class="meta-item"><label>Market</label><span>${market}</span></div>
      <div class="meta-item"><label>Followers</label><span>${form.minimumFollowers?.toLocaleString()} – ${form.maximumFollowers?.toLocaleString()}</span></div>
      <div class="meta-item"><label>Engagement</label><span>Min ${form.minEngagementRate}%</span></div>
      ${form.startDate ? `<div class="meta-item"><label>Timeline</label><span>${form.startDate} → ${form.endDate || 'TBD'}</span></div>` : ''}
      ${form.exclusivity ? `<div class="meta-item"><label>Exclusivity</label><span>Required</span></div>` : ''}
      ${form.contentFormats?.length ? `<div class="meta-item"><label>Formats</label><span>${form.contentFormats.join(', ')}</span></div>` : ''}
      ${form.contentRequirements?.length ? `<div class="meta-item"><label>Requirements</label><span>${form.contentRequirements.join(', ')}</span></div>` : ''}
    </div>
    <h2>Top ${matches.length} Matched Influencers</h2>
    ${matches.map((m, i) => `<div class="influencer"><div class="inf-header"><div><div class="inf-name">#${i + 1} ${m.displayName} ${favourites.has(m.influencerId) ? '<span class="fav">❤ Favourited</span>' : ''}</div><div style="color:#888;font-size:12px">${m.instagramHandle || ''} · ${m.nicheName || ''} · ${m.marketName || ''}</div></div><div class="inf-score">${m.matchScore}<span style="font-size:12px;color:#888">/100</span></div></div><div class="stats"><div class="stat"><label>Followers</label><span>${m.followerCount?.toLocaleString()}</span></div><div class="stat"><label>Engagement</label><span>${m.engagementRate}%</span></div><div class="stat"><label>Bot Score</label><span>${(m.botScore * 100).toFixed(0)}%</span></div></div>${m.matchReason ? `<div class="reason">${m.matchReason}</div>` : ''}</div>`).join('')}
    <div class="footer"><span>MatFluenca · The Ablant Co.</span><span>${form.campaignTitle} · ${new Date().toLocaleDateString()}</span></div>
    </body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    setTimeout(() => { win?.print(); URL.revokeObjectURL(url) }, 800)
  }

  const radar = selected ? [
    { axis: 'Niche', value: selected.scoreBreakdown?.nicheScore || 0, full: 30 },
    { axis: 'Followers', value: selected.scoreBreakdown?.followerScore || 0, full: 20 },
    { axis: 'Engagement', value: selected.scoreBreakdown?.engagementScore || 0, full: 25 },
    { axis: 'Authenticity', value: selected.scoreBreakdown?.botScore || 0, full: 15 },
    { axis: 'Platform', value: selected.scoreBreakdown?.platformScore || 0, full: 10 },
  ] : []

  const accent = '#c084fc'

  return (
    <div className="p-7 page-fade">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={18} style={{ color: accent }} />
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Intelligence Layer</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: '#555' }}>Deep analysis and strategic insights for your client campaigns</p>

      {!results ? (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{ background: i <= step ? accent : '#1a1a1a', color: i <= step ? '#0a0a0a' : '#555' }}>{i + 1}</div>
                <span className="text-sm" style={{ color: i === step ? accent : '#444' }}>{s}</span>
                {i < STEPS.length - 1 && <div className="w-6 h-px mx-1" style={{ background: '#1a1a1a' }} />}
              </div>
            ))}
          </div>

          {/* Step 0 — Brief */}
          {step === 0 && (
            <div className="max-w-2xl space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Campaign Title</label><input className="input" placeholder="e.g. Summer Beauty Launch" value={form.campaignTitle} onChange={e => set('campaignTitle', e.target.value)} /></div>
                <div><label className="label">Client Name</label><input className="input" placeholder="e.g. Clicks SA" value={form.clientName} onChange={e => set('clientName', e.target.value)} /></div>
              </div>
              <div><label className="label">Campaign Description</label>
                <textarea className="input" rows={3} placeholder="Describe the campaign goals, product and what you need from influencers..." value={form.campaignDescription} onChange={e => set('campaignDescription', e.target.value)} />
              </div>
              <div>
                <label className="label">Campaign Objective</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {OBJECTIVES.map(o => (
                    <button key={o.value} onClick={() => set('objective', o.value)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{ background: form.objective === o.value ? `${accent}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${form.objective === o.value ? accent : '#1a1a1a'}` }}>
                      <p className="text-xs font-semibold" style={{ color: form.objective === o.value ? accent : '#ccc' }}>{o.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#555' }}>{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(1)} disabled={!form.campaignTitle || !form.campaignDescription || !form.objective}
                className="btn-primary" style={{ background: accent, color: '#0a0a0a' }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Step 1 — Campaign Details */}
          {step === 1 && (
            <div className="max-w-2xl space-y-5">
              <div>
                <label className="label">Target Platform</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {['Instagram', 'TikTok', 'YouTube', 'Twitter/X'].map(p => (
                    <button key={p} onClick={() => set('targetPlatform', p)}
                      className="px-4 py-2 rounded-lg text-sm transition-all"
                      style={{ background: form.targetPlatform === p ? `${accent}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${form.targetPlatform === p ? accent : '#1a1a1a'}`, color: form.targetPlatform === p ? accent : '#888' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Content Formats <span style={{ color: '#555', fontWeight: 400 }}>(select all that apply)</span></label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {CONTENT_FORMATS.map(f => (
                    <button key={f} onClick={() => toggleArray('contentFormats', f)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ background: form.contentFormats?.includes(f) ? `${accent}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${form.contentFormats?.includes(f) ? accent : '#1a1a1a'}`, color: form.contentFormats?.includes(f) ? accent : '#888' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Content Requirements <span style={{ color: '#555', fontWeight: 400 }}>(select all that apply)</span></label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {CONTENT_REQUIREMENTS.map(r => (
                    <button key={r} onClick={() => toggleArray('contentRequirements', r)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ background: form.contentRequirements?.includes(r) ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${form.contentRequirements?.includes(r) ? '#60a5fa' : '#1a1a1a'}`, color: form.contentRequirements?.includes(r) ? '#60a5fa' : '#888' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Campaign Timeline</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div><label className="text-xs mb-1 block" style={{ color: '#555' }}>Start Date</label><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
                  <div><label className="text-xs mb-1 block" style={{ color: '#555' }}>End Date</label><input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                <div>
                  <p className="text-sm font-semibold text-white">Exclusivity Required</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>Influencer cannot work with competitor brands during the campaign</p>
                </div>
                <button onClick={() => set('exclusivity', !form.exclusivity)}
                  className="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: form.exclusivity ? accent : '#2a2a2a' }}>
                  <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all" style={{ left: form.exclusivity ? '24px' : '4px' }} />
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary"><ChevronLeft size={14} />Back</button>
                <button onClick={() => setStep(2)} className="btn-primary" style={{ background: accent, color: '#0a0a0a' }}>Next <ChevronRight size={14} /></button>
              </div>
            </div>
          )}

          {/* Step 2 — Audience */}
          {step === 2 && (
            <div className="max-w-2xl space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Niche</label>
                  <select className="input text-sm" value={form.nicheId || ''} onChange={e => set('nicheId', e.target.value ? parseInt(e.target.value) : null)}>
                    <option value="">Any niche</option>{niches.map(n => <option key={n.id} value={n.id}>{n.nicheName}</option>)}
                  </select>
                </div>
                <div><label className="label">Market</label>
                  <select className="input text-sm" value={form.marketId || ''} onChange={e => set('marketId', e.target.value ? parseInt(e.target.value) : null)}>
                    <option value="">Any market</option>{markets.map(m => <option key={m.id} value={m.id}>{m.marketName}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Min Followers</label><input className="input" type="number" value={form.minimumFollowers} onChange={e => set('minimumFollowers', parseInt(e.target.value))} /></div>
                <div><label className="label">Max Followers</label><input className="input" type="number" value={form.maximumFollowers} onChange={e => set('maximumFollowers', parseInt(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Min Age</label><input className="input" type="number" value={form.audienceAgeMin} onChange={e => set('audienceAgeMin', parseInt(e.target.value))} /></div>
                <div><label className="label">Max Age</label><input className="input" type="number" value={form.audienceAgeMax} onChange={e => set('audienceAgeMax', parseInt(e.target.value))} /></div>
                <div><label className="label">Gender</label>
                  <select className="input" value={form.audienceGender} onChange={e => set('audienceGender', e.target.value)}>
                    {['Any', 'Male', 'Female'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Min Engagement %</label><input className="input" type="number" step="0.5" value={form.minEngagementRate} onChange={e => set('minEngagementRate', parseFloat(e.target.value))} /></div>
                <div><label className="label">Max Bot Score</label><input className="input" type="number" step="0.05" max="1" value={form.maxBotScore} onChange={e => set('maxBotScore', parseFloat(e.target.value))} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary"><ChevronLeft size={14} />Back</button>
                <button onClick={handleMatch} disabled={loading || !form.campaignTitle} className="btn-primary" style={{ background: accent, color: '#0a0a0a' }}>
                  {loading ? 'Analysing...' : <><Search size={13} /> Run Intelligence Match</>}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Results view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — matches list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: '#555' }}>{results.message}</p>
              <button onClick={() => { setResults(null); setStep(0); setSaved(false) }} className="btn-secondary text-xs">New Search</button>
            </div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button onClick={handleExportPDF} className="btn-secondary text-xs flex items-center gap-1"><Download size={10} />PDF</button>
              {!saved
                ? <button onClick={handleSave} disabled={saving} className="btn-secondary text-xs flex items-center gap-1"><Save size={10} />{saving ? 'Saving...' : 'Save'}</button>
                : <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>✓ Saved</span>
              }
              {favourites.size > 0 && <span className="flex items-center gap-1 text-xs" style={{ color: '#f87171' }}><Heart size={10} fill="#f87171" />{favourites.size} fav</span>}
            </div>

            {expandedNotice && (
              <div className="p-3 rounded-lg mb-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <p className="text-xs" style={{ color: '#fbbf24' }}>⚡ Search expanded to: {expandedNotice.join(', ')}</p>
              </div>
            )}

            {results.matches?.map((m, i) => (
              <button key={m.influencerId} onClick={() => setSelected(m)}
                className="card p-4 w-full text-left card-hover"
                style={{ borderColor: selected?.influencerId === m.influencerId ? 'rgba(192,132,252,0.3)' : undefined }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(192,132,252,0.1)', color: accent }}>#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold truncate" style={{ color: '#ccc' }}>{m.displayName}</p>
                      <button onClick={e => { e.stopPropagation(); toggleFavourite(m.influencerId) }}>
                        <Heart size={11} fill={favourites.has(m.influencerId) ? '#f87171' : 'none'} style={{ color: favourites.has(m.influencerId) ? '#f87171' : '#555' }} />
                      </button>
                    </div>
                    <p className="text-xs" style={{ color: '#444' }}>{m.nicheName} · {m.followerCount?.toLocaleString()}</p>
                  </div>
                  <span className="font-bold text-sm flex-shrink-0" style={{ color: accent }}>{m.matchScore}</span>
                </div>
                <ScoreBar score={m.matchScore} color={accent} />
              </button>
            ))}
          </div>

          {/* Middle — deep analysis */}
          <div className="space-y-3">
            {selected ? (
              <>
                <div className="card p-5">
                  <p className="label mb-2">Score Breakdown</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadarChart data={radar}>
                      <PolarGrid stroke="#1a1a1a" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: '#555', fontSize: 10 }} />
                      <Radar dataKey="value" stroke={accent} fill={accent} fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-1 space-y-1">{radar.map(d => <div key={d.axis} className="flex justify-between text-xs"><span style={{ color: '#555' }}>{d.axis}</span><span className="font-semibold" style={{ color: accent }}>{d.value}/{d.full}</span></div>)}</div>
                </div>
                <div className="card p-4">
                  <p className="label mb-2">Authenticity</p>
                  <BotBadge score={selected.botScore} />
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: '#555' }}>
                    {selected.botScore <= 0.05 ? 'Highly authentic — low risk.' : selected.botScore <= 0.15 ? 'Mostly authentic — acceptable.' : 'Elevated signals — review carefully.'}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="label mb-2">ROI Estimate</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span style={{ color: '#555' }}>Est. Reach</span><span style={{ color: '#ccc' }}>{Math.round(selected.followerCount * (selected.engagementRate / 100) * 8).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span style={{ color: '#555' }}>Est. Engagements</span><span style={{ color: '#ccc' }}>{Math.round(selected.followerCount * (selected.engagementRate / 100)).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span style={{ color: '#555' }}>Authenticity Factor</span><span style={{ color: '#4ade80' }}>{((1 - selected.botScore) * 100).toFixed(0)}%</span></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-8 text-center"><Brain size={24} style={{ color: '#333', margin: '0 auto 8px' }} /><p className="text-sm" style={{ color: '#555' }}>Select a match for deep analysis</p></div>
            )}
          </div>

          {/* Right — AI insight + outreach */}
          <div className="space-y-3">
            {selected ? (
              <>
                <div className="card p-4">
                  <p className="label mb-2">AI Insight</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{selected.matchReason || 'No AI reasoning available.'}</p>
                </div>
                {selected.redFlags?.length > 0 && (
                  <div className="card p-4" style={{ borderColor: 'rgba(251,191,36,0.2)' }}>
                    <p className="label mb-1" style={{ color: '#fbbf24' }}>Red Flags</p>
                    {selected.redFlags.map((f, i) => <p key={i} className="text-xs" style={{ color: '#fbbf24' }}>⚠ {f}</p>)}
                  </div>
                )}
                <div className="card p-4">
                  <p className="label mb-3">Outreach</p>
                  <button onClick={() => handleSend(selected)} className="btn-primary w-full justify-center text-sm"
                    style={{ background: copiedId === selected.influencerId ? '#4ade80' : accent, color: '#0a0a0a' }}>
                    <Send size={12} />{copiedId === selected.influencerId ? 'DM Copied!' : 'Copy Outreach DM'}
                  </button>
                  {copiedId === selected.influencerId && (
                    <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <p className="text-xs" style={{ color: '#4ade80' }}>✓ DM copied. Paste into Instagram.</p>
                      {selected.email && (
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(74,222,128,0.15)' }}>
                          <p className="text-xs mb-1" style={{ color: '#555' }}>Email:</p>
                          <a href={`mailto:${selected.email}`} className="text-xs font-mono" style={{ color: '#60a5fa' }}>{selected.email}</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="card p-4">
                  <p className="label mb-2">Campaign Details</p>
                  <div className="space-y-1 text-xs" style={{ color: '#555' }}>
                    {form.clientName && <div className="flex justify-between"><span>Client</span><span style={{ color: '#ccc' }}>{form.clientName}</span></div>}
                    <div className="flex justify-between"><span>Objective</span><span style={{ color: '#ccc' }}>{OBJECTIVES.find(o => o.value === form.objective)?.label || '—'}</span></div>
                    {form.contentFormats?.length > 0 && <div className="flex justify-between"><span>Formats</span><span style={{ color: '#ccc' }}>{form.contentFormats.join(', ')}</span></div>}
                    {form.startDate && <div className="flex justify-between"><span>Timeline</span><span style={{ color: '#ccc' }}>{form.startDate} → {form.endDate || 'TBD'}</span></div>}
                    {form.exclusivity && <div className="flex justify-between"><span>Exclusivity</span><span style={{ color: '#fbbf24' }}>Required</span></div>}
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-8 text-center"><p className="text-sm" style={{ color: '#555' }}>Select a match for insights</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
