import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import ScoreBar from '../../components/ScoreBar'
import BotBadge from '../../components/BotBadge'
import { ChevronRight, ChevronLeft, Send, Save, Download, RefreshCw, Heart } from 'lucide-react'

const STEPS = ['Brief', 'Audience', 'Results']

export default function BrandNewCampaign() {
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedNotice, setExpandedNotice] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [favourites, setFavourites] = useState(new Set())

  const [form, setForm] = useState({
    campaignTitle: '', campaignDescription: '', targetPlatform: 'Instagram',
    contentType: '', nicheId: null, marketId: null,
    minimumFollowers: 10000, maximumFollowers: 500000,
    audienceAgeMin: 18, audienceAgeMax: 35,
    audienceGender: 'Any', minEngagementRate: 1.0, maxBotScore: 0.3
  })

  useEffect(() => {
    api.getNiches().then(r => setNiches(r.data))
    api.getMarkets().then(r => setMarkets(r.data))
    try {
      const rerun = JSON.parse(localStorage.getItem('mf_rerun_campaign') || 'null')
      if (rerun) { setForm(prev => ({ ...prev, ...rerun })); localStorage.removeItem('mf_rerun_campaign') }
    } catch {}
  }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleFavourite = (influencerId) => {
    setFavourites(prev => {
      const next = new Set(prev)
      if (next.has(influencerId)) next.delete(influencerId)
      else next.add(influencerId)
      return next
    })
  }

  const handleMatch = async () => {
    setLoading(true); setSaved(false)
    try {
      const res = await api.runMatch(session.token, form)
      setResults(res.data)
      if (res.data.expanded) setExpandedNotice(res.data.expandedNiches)
      setStep(2)
    } catch (err) { alert(err.response?.data || 'Match failed. Check your filters.') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const today = new Date()
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const fmt = (d) => d.toISOString().split('T')[0]
      const saveRes = await api.saveCampaign(session.token, {
        title: `${form.campaignTitle} — ${Date.now()}`,
        description: form.campaignDescription,
        targetPlatform: form.targetPlatform || 'Instagram',
        audienceAgeMin: parseInt(form.audienceAgeMin) || 18,
        audienceAgeMax: parseInt(form.audienceAgeMax) || 35,
        audienceGender: form.audienceGender || 'Any',
        contentType: form.contentType || '',
        minimumFollowers: parseInt(form.minimumFollowers) || 10000,
        maximumFollowers: parseInt(form.maximumFollowers) || 500000,
        startDate: fmt(today),
        endDate: fmt(endDate),
        nicheId: form.nicheId || null,
        marketId: form.marketId || null,
        createdByBrandId: session.userType === 'Brand' ? session.id : null,
        createdByAgencyId: session.userType === 'Agency' ? session.id : null
      })
      setSaved(true)
      if (favourites.size > 0) {
        try {
          const existing = JSON.parse(localStorage.getItem('mf_favourites') || '{}')
          const campaignId = saveRes?.data?.id || form.campaignTitle
          existing[campaignId] = [...favourites]
          localStorage.setItem('mf_favourites', JSON.stringify(existing))
        } catch {}
      }
    } catch (err) { alert(err.response?.data?.message || err.response?.data || 'Failed to save campaign.') }
    finally { setSaving(false) }
  }

  const handleRegenerate = async () => {
    setLoading(true); setSaved(false); setExpandedNotice(null)
    try {
      const wider = { ...form, minimumFollowers: Math.round(form.minimumFollowers * 0.5), maximumFollowers: Math.round(form.maximumFollowers * 1.5), minEngagementRate: Math.max(0.5, (form.minEngagementRate || 1) * 0.5), nicheId: null }
      const res = await api.runMatch(session.token, wider)
      setResults(res.data)
      if (res.data.expanded) setExpandedNotice(res.data.expandedNiches)
    } catch (err) { alert(err.response?.data || 'Match failed.') }
    finally { setLoading(false) }
  }

  const handleExportPDF = () => {
    const matches = results?.matches || []
    const niche = niches.find(n => n.id === form.nicheId)?.nicheName || 'Any'
    const market = markets.find(m => m.id === form.marketId)?.marketName || 'Any'
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${form.campaignTitle} — MatFluenca Report</title>
    <style>body{font-family:Arial,sans-serif;color:#111;padding:40px;max-width:800px;margin:0 auto}h1{font-size:24px;margin-bottom:4px}.subtitle{color:#666;font-size:14px;margin-bottom:24px}.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:32px;padding:16px;background:#f5f5f5;border-radius:8px}.meta-item label{font-size:11px;color:#888;text-transform:uppercase;display:block;margin-bottom:2px}.meta-item span{font-size:14px;font-weight:600}.influencer{border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin-bottom:16px}.inf-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}.inf-name{font-size:16px;font-weight:700}.inf-score{font-size:22px;font-weight:800;color:#2563eb}.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}.stat label{font-size:11px;color:#888;text-transform:uppercase;display:block}.stat span{font-size:14px;font-weight:600}.reason{font-size:13px;color:#444;line-height:1.6;margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:11px;color:#aaa;display:flex;justify-content:space-between}</style>
    </head><body>
    <h1>${form.campaignTitle}</h1>
    <p class="subtitle">MatFluenca Campaign Report · ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <div class="meta">
      <div class="meta-item"><label>Platform</label><span>${form.targetPlatform}</span></div>
      <div class="meta-item"><label>Niche</label><span>${niche}</span></div>
      <div class="meta-item"><label>Market</label><span>${market}</span></div>
      <div class="meta-item"><label>Min Followers</label><span>${form.minimumFollowers?.toLocaleString()}</span></div>
      <div class="meta-item"><label>Max Followers</label><span>${form.maximumFollowers?.toLocaleString()}</span></div>
      <div class="meta-item"><label>Min Engagement</label><span>${form.minEngagementRate}%</span></div>
    </div>
    ${matches.map((m, i) => `<div class="influencer"><div class="inf-header"><div><div class="inf-name">#${i + 1} ${m.displayName}</div><div style="color:#888;font-size:12px">${m.instagramHandle || ''} · ${m.nicheName || ''} · ${m.marketName || ''}</div></div><div class="inf-score">${m.matchScore}<span style="font-size:12px;color:#888">/100</span></div></div><div class="stats"><div class="stat"><label>Followers</label><span>${m.followerCount?.toLocaleString()}</span></div><div class="stat"><label>Engagement</label><span>${m.engagementRate}%</span></div><div class="stat"><label>Bot Score</label><span>${(m.botScore * 100).toFixed(0)}%</span></div></div>${m.matchReason ? `<div class="reason">${m.matchReason}</div>` : ''}</div>`).join('')}
    <div class="footer"><span>MatFluenca · The Ablant Co.</span><span>${new Date().toLocaleDateString()}</span></div>
    </body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    setTimeout(() => { win?.print(); URL.revokeObjectURL(url) }, 800)
  }

  const handleSend = (m) => {
    const brandName = session.name || 'A brand'
    const msg = `Hi @${m.displayName}! 👋\n\n${brandName} would like to invite you to collaborate on our "${form.campaignTitle}" campaign on ${form.targetPlatform || 'Instagram'}.\n\nTo accept this invitation and view full campaign details, please sign up to MatFluenca — Africa's Influencer Intelligence Platform:\nhttps://matfluenca.vercel.app/influencer/login\n\nWe look forward to working with you! 🚀\n\nPowered by MatFluenca | A Product of The Ablant Co.`
    navigator.clipboard.writeText(msg).then(() => { setCopiedId(m.influencerId) })
  }

  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne,sans-serif' }}>New Campaign</h1>
      <p className="text-sm mb-7" style={{ color: '#555' }}>Find the best influencers for your brief</p>

      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: i <= step ? '#60a5fa' : '#1a1a1a', color: i <= step ? '#0a0a0a' : '#555' }}>{i + 1}</div>
            <span className="text-sm" style={{ color: i === step ? '#60a5fa' : '#444' }}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-6 h-px mx-1" style={{ background: '#1a1a1a' }} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="max-w-xl space-y-4">
          <div><label className="label">Campaign Title</label><input className="input" placeholder="Summer Fitness Launch" value={form.campaignTitle} onChange={e => set('campaignTitle', e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} placeholder="Tell us what this campaign is about..." value={form.campaignDescription} onChange={e => set('campaignDescription', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Platform</label>
              <select className="input" value={form.targetPlatform} onChange={e => set('targetPlatform', e.target.value)}>
                {['Instagram', 'TikTok', 'YouTube', 'Twitter'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Content Type</label><input className="input" placeholder="Reels, Posts..." value={form.contentType} onChange={e => set('contentType', e.target.value)} /></div>
          </div>
          <button onClick={() => setStep(1)} disabled={!form.campaignTitle || !form.campaignDescription}
            className="btn-primary" style={{ background: '#60a5fa', color: '#0a0a0a' }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Niche</label>
              <select className="input" value={form.nicheId || ''} onChange={e => set('nicheId', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Any niche</option>{niches.map(n => <option key={n.id} value={n.id}>{n.nicheName}</option>)}
              </select>
            </div>
            <div><label className="label">Market</label>
              <select className="input" value={form.marketId || ''} onChange={e => set('marketId', e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Any market</option>{markets.map(m => <option key={m.id} value={m.id}>{m.marketName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Min Followers</label><input className="input" type="number" value={form.minimumFollowers} onChange={e => set('minimumFollowers', parseInt(e.target.value))} /></div>
            <div><label className="label">Max Followers</label><input className="input" type="number" value={form.maximumFollowers} onChange={e => set('maximumFollowers', parseInt(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Min Engagement %</label><input className="input" type="number" step="0.5" value={form.minEngagementRate} onChange={e => set('minEngagementRate', parseFloat(e.target.value))} /></div>
            <div><label className="label">Max Bot Score</label><input className="input" type="number" step="0.05" max="1" value={form.maxBotScore} onChange={e => set('maxBotScore', parseFloat(e.target.value))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary"><ChevronLeft size={14} />Back</button>
            <button onClick={handleMatch} disabled={loading} className="btn-primary" style={{ background: '#60a5fa', color: '#0a0a0a' }}>
              {loading ? 'Finding matches...' : <><span>Find Influencers</span> <ChevronRight size={14} /></>}
            </button>
          </div>
        </div>
      )}

      {expandedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card p-8 max-w-md w-full mx-4" style={{ border: '1px solid rgba(251,191,36,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Search Expanded</p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>Not enough exact matches found</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#888' }}>
              We expanded the search to include closely related niches: <span style={{ color: '#fbbf24', fontWeight: 600 }}>{expandedNotice.join(', ')}</span>.
            </p>
            <button onClick={() => setExpandedNotice(null)} className="btn-primary w-full justify-center" style={{ background: '#fbbf24', color: '#0a0a0a' }}>
              Got it, show results
            </button>
          </div>
        </div>
      )}

      {step === 2 && results && (
        <div>
          <div className="card p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-white text-sm">{form.campaignTitle}</p>
              <div className="flex items-center gap-3 mt-1">
                {favourites.size > 0 && <span className="flex items-center gap-1 text-xs" style={{ color: '#f87171' }}><Heart size={10} fill="#f87171" />{favourites.size} favourite{favourites.size !== 1 ? 's' : ''}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRegenerate} disabled={loading} className="btn-secondary text-sm flex items-center gap-1.5">
                <RefreshCw size={12} />{loading ? 'Searching...' : 'Widen Search'}
              </button>
              <button onClick={handleExportPDF} className="btn-secondary text-sm flex items-center gap-1.5"><Download size={12} />PDF</button>
              {!saved
                ? <button onClick={handleSave} disabled={saving} className="btn-secondary text-sm flex items-center gap-1.5"><Save size={12} />{saving ? 'Saving...' : 'Save Campaign'}</button>
                : <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>✓ Saved</span>
              }
              <button onClick={() => { setStep(0); setSaved(false); setExpandedNotice(null) }} className="btn-secondary text-sm"><ChevronLeft size={13} />New Search</button>
            </div>
          </div>

          <div className="space-y-4">
            {(results.matches || []).map((m, i) => (
              <div key={m.influencerId} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>#{i + 1}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{m.displayName}</p>
                        <button onClick={() => toggleFavourite(m.influencerId)}>
                          <Heart size={14} fill={favourites.has(m.influencerId) ? '#f87171' : 'none'} style={{ color: favourites.has(m.influencerId) ? '#f87171' : '#555' }} />
                        </button>
                        {m.isExpandedResult && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>Related niche</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#555' }}>{m.nicheName} · {m.marketName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BotBadge score={m.botScore} />
                    <p className="text-2xl font-bold" style={{ color: '#60a5fa', fontFamily: 'Syne,sans-serif' }}>{m.matchScore}<span className="text-xs font-normal" style={{ color: '#555' }}>/100</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{ label: 'Followers', value: m.followerCount?.toLocaleString() }, { label: 'Engagement', value: `${m.engagementRate}%` }, { label: 'Handle', value: m.instagramHandle || '—' }].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                      <p className="text-xs mb-0.5" style={{ color: '#444' }}>{label}</p>
                      <p className="text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <ScoreBar score={m.matchScore} color="#60a5fa" />
                {m.matchReason && <p className="text-xs mt-3 leading-relaxed" style={{ color: '#666' }}>{m.matchReason}</p>}
                {m.redFlags?.length > 0 && <div className="mt-2">{m.redFlags.map((f, j) => <p key={j} className="text-xs" style={{ color: '#fbbf24' }}>⚠ {f}</p>)}</div>}
                <div className="mt-4 space-y-2">
                  <button onClick={() => handleSend(m)} className="btn-primary text-sm"
                    style={{ background: copiedId === m.influencerId ? '#4ade80' : '#60a5fa', color: '#0a0a0a' }}>
                    <Send size={12} />{copiedId === m.influencerId ? 'DM Copied!' : 'Send Outreach'}
                  </button>
                  {copiedId === m.influencerId && (
                    <div className="p-3 rounded-lg relative" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <button onClick={() => setCopiedId(null)} className="absolute top-2 right-2 hover:opacity-70" style={{ color: '#555' }}>✕</button>
                      <p className="text-xs pr-4" style={{ color: '#4ade80' }}>✓ Custom DM copied to clipboard. Paste it into Instagram.</p>
                      {m.email && (
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(74,222,128,0.15)' }}>
                          <p className="text-xs mb-1" style={{ color: '#555' }}>Or reach out via email:</p>
                          <a href={`mailto:${m.email}`} className="text-xs font-mono hover:opacity-70" style={{ color: '#60a5fa' }}>{m.email}</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
