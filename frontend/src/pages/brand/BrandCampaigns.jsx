import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import ScoreBar from '../../components/ScoreBar'
import BotBadge from '../../components/BotBadge'
import { Megaphone, Heart, Send, Download, ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BrandCampaigns() {
  const { session } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [favourites, setFavourites] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.getBrandCampaigns(session.token)
      .then(r => setCampaigns(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    try {
      const saved = JSON.parse(localStorage.getItem('mf_favourites') || '{}')
      const parsed = {}
      for (const k in saved) parsed[k] = new Set(saved[k])
      setFavourites(parsed)
    } catch {}
  }, [])

  const toggleFavourite = (campaignId, influencerId) => {
    setFavourites(prev => {
      const next = { ...prev }
      if (!next[campaignId]) next[campaignId] = new Set()
      else next[campaignId] = new Set(next[campaignId])
      if (next[campaignId].has(influencerId)) next[campaignId].delete(influencerId)
      else next[campaignId].add(influencerId)
      const toSave = {}
      for (const k in next) toSave[k] = [...next[k]]
      localStorage.setItem('mf_favourites', JSON.stringify(toSave))
      return next
    })
  }

  const getFavCount = (campaignId) => favourites[campaignId]?.size || 0
  const isFav = (campaignId, influencerId) => favourites[campaignId]?.has(influencerId) || false

  const handleSend = (inf, campaignTitle) => {
    const brandName = session.name || 'A brand'
    const msg = `Hi @${inf.influencer?.displayName || inf.displayName}! 👋\n\n${brandName} would like to invite you to collaborate on our "${campaignTitle}" campaign.\n\nTo accept this invitation and view full campaign details, please sign up to MatFluenca — Africa's Influencer Intelligence Platform:\nhttps://matfluenca.vercel.app/influencer/login\n\nWe look forward to working with you! 🚀\n\nPowered by MatFluenca | A Product of The Ablant Co.`
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedId(inf.influencerId)
    })
  }

  const handleRerun = (c) => {
    // Store campaign details for pre-filling new campaign form
    localStorage.setItem('mf_rerun_campaign', JSON.stringify({
      campaignTitle: c.title.split(' — ')[0], // remove timestamp suffix
      campaignDescription: c.description,
      targetPlatform: c.targetPlatform,
      nicheId: c.nicheId,
      marketId: c.marketId,
      minimumFollowers: c.minimumFollowers,
      maximumFollowers: c.maximumFollowers,
      audienceAgeMin: c.audienceAgeMin,
      audienceAgeMax: c.audienceAgeMax,
      audienceGender: c.audienceGender,
      contentType: c.contentType,
    }))
    navigate('/brand/new-campaign')
  }

  const handleExportPDF = (c) => {
    const matches = c.matchedInfluencers || []
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${c.title} — MatFluenca Report</title>
    <style>
      body{font-family:Arial,sans-serif;color:#111;padding:40px;max-width:800px;margin:0 auto}
      h1{font-size:24px;margin-bottom:4px}
      .subtitle{color:#666;font-size:14px;margin-bottom:24px}
      .meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:32px;padding:16px;background:#f5f5f5;border-radius:8px}
      .meta-item label{font-size:11px;color:#888;text-transform:uppercase;display:block;margin-bottom:2px}
      .meta-item span{font-size:14px;font-weight:600}
      .influencer{border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin-bottom:16px}
      .inf-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
      .inf-name{font-size:16px;font-weight:700}
      .inf-score{font-size:22px;font-weight:800;color:#2563eb}
      .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:12px 0}
      .stat label{font-size:11px;color:#888;text-transform:uppercase;display:block}
      .stat span{font-size:14px;font-weight:600}
      .reason{background:#f5f5f5;border-radius:6px;padding:12px;font-size:13px;color:#444;margin-top:8px}
      .fav{color:#e11d48;font-weight:600;font-size:12px}
    </style>
    </head><body>
    <h1>${c.title.split(' — ')[0]}</h1>
    <p class="subtitle">MatFluenca Campaign Report · ${new Date().toLocaleDateString('en-ZA')}</p>
    <div class="meta">
      <div class="meta-item"><label>Platform</label><span>${c.targetPlatform}</span></div>
      <div class="meta-item"><label>Niche</label><span>${c.niche?.nicheName || '—'}</span></div>
      <div class="meta-item"><label>Market</label><span>${c.market?.marketName || '—'}</span></div>
      <div class="meta-item"><label>Min Followers</label><span>${c.minimumFollowers?.toLocaleString()}</span></div>
      <div class="meta-item"><label>Max Followers</label><span>${c.maximumFollowers?.toLocaleString()}</span></div>
      <div class="meta-item"><label>Favourites</label><span>${getFavCount(c.id)}</span></div>
    </div>
    ${matches.map((mi, i) => {
      const inf = mi.influencer || {}
      const favd = isFav(c.id, mi.influencerId)
      return `<div class="influencer">
        <div class="inf-header">
          <div>
            <div class="inf-name">#${i+1} ${inf.displayName || inf.name} ${favd ? '<span class="fav">❤ Favourited</span>' : ''}</div>
            <div style="color:#888;font-size:12px;margin-top:2px">${inf.niche?.nicheName || ''} · ${inf.market?.marketName || ''}</div>
          </div>
          <div class="inf-score">${mi.matchScore}<span style="font-size:12px;color:#888">/100</span></div>
        </div>
        <div class="stats">
          <div class="stat"><label>Followers</label><span>${inf.followerCount?.toLocaleString() || '—'}</span></div>
          <div class="stat"><label>Engagement</label><span>${inf.engagementRate || '—'}%</span></div>
          <div class="stat"><label>Handle</label><span>${inf.instagramHandle || '—'}</span></div>
        </div>
        ${mi.matchReason ? `<div class="reason">${mi.matchReason}</div>` : ''}
      </div>`
    }).join('')}
    </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.print()
  }

  if (loading) return <Loader />

  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>My Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>All campaigns you've created</p>
        </div>
        <button onClick={() => navigate('/brand/new-campaign')} className="btn-primary text-sm" style={{ background: '#60a5fa', color: '#0a0a0a' }}>+ New Campaign</button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet" sub="Create your first campaign to find matched influencers."
          action={<button onClick={() => navigate('/brand/new-campaign')} className="btn-primary" style={{ background: '#60a5fa', color: '#0a0a0a' }}>Create Campaign</button>} />
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="card overflow-hidden">

              {/* Campaign header */}
              <div className="p-5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{c.title.split(' — ')[0]}</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#555' }}>{c.description?.slice(0, 100)}...</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>{c.targetPlatform}</span>
                      {c.niche && <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>{c.niche.nicheName}</span>}
                      {c.market && <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>{c.market.marketName}</span>}
                      {getFavCount(c.id) > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#f87171' }}>
                          <Heart size={10} fill="#f87171" /> {getFavCount(c.id)} favourite{getFavCount(c.id) !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: '#444' }}>{c.matchedInfluencers?.length || 0} matched</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); handleExportPDF(c) }} className="btn-secondary text-xs flex items-center gap-1">
                      <Download size={11} /> PDF
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleRerun(c) }} className="btn-secondary text-xs flex items-center gap-1">
                      <Search size={11} /> Re-run
                    </button>
                    {expanded === c.id ? <ChevronUp size={16} style={{ color: '#555' }} /> : <ChevronDown size={16} style={{ color: '#555' }} />}
                  </div>
                </div>
              </div>

              {/* Expanded view */}
              {expanded === c.id && (
                <div style={{ borderTop: '1px solid #1a1a1a' }}>

                  {/* Campaign details */}
                  <div className="p-5 grid grid-cols-3 gap-3" style={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(255,255,255,0.01)' }}>
                    {[
                      { label: 'Platform', value: c.targetPlatform },
                      { label: 'Niche', value: c.niche?.nicheName || '—' },
                      { label: 'Market', value: c.market?.marketName || '—' },
                      { label: 'Min Followers', value: c.minimumFollowers?.toLocaleString() },
                      { label: 'Max Followers', value: c.maximumFollowers?.toLocaleString() },
                      { label: 'Audience Age', value: `${c.audienceAgeMin}–${c.audienceAgeMax}` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs mb-0.5" style={{ color: '#444' }}>{label}</p>
                        <p className="text-sm font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Matched influencers */}
                  {!c.matchedInfluencers?.length ? (
                    <div className="p-6 text-center">
                      <p className="text-sm" style={{ color: '#555' }}>No matched influencers saved for this campaign.</p>
                      <button onClick={() => handleRerun(c)} className="btn-primary text-xs mt-3" style={{ background: '#60a5fa', color: '#0a0a0a' }}>
                        <Search size={11} /> Run Search
                      </button>
                    </div>
                  ) : (
                    <div>
                      {c.matchedInfluencers.map((mi, i) => {
                        const inf = mi.influencer || {}
                        const favd = isFav(c.id, mi.influencerId)
                        return (
                          <div key={mi.influencerId} className="p-5" style={{ borderBottom: '1px solid #111' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>#{i + 1}</div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-white">{inf.displayName || inf.name}</p>
                                    <button onClick={() => toggleFavourite(c.id, mi.influencerId)} className="transition-colors">
                                      <Heart size={14} fill={favd ? '#f87171' : 'none'} style={{ color: favd ? '#f87171' : '#555' }} />
                                    </button>
                                    {favd && <span className="text-xs" style={{ color: '#f87171' }}>Favourited</span>}
                                  </div>
                                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>{inf.niche?.nicheName} · {inf.market?.marketName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold" style={{ color: '#60a5fa', fontFamily: 'Syne,sans-serif' }}>{mi.matchScore}<span className="text-xs font-normal" style={{ color: '#555' }}>/100</span></p>
                                <BotBadge score={inf.botScore} />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                              {[
                                { label: 'Followers', value: inf.followerCount?.toLocaleString() },
                                { label: 'Engagement', value: `${inf.engagementRate}%` },
                                { label: 'Handle', value: inf.instagramHandle || '—' },
                              ].map(({ label, value }) => (
                                <div key={label} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                                  <p className="text-xs mb-0.5" style={{ color: '#444' }}>{label}</p>
                                  <p className="text-sm font-semibold text-white">{value}</p>
                                </div>
                              ))}
                            </div>

                            <ScoreBar score={mi.matchScore} color="#60a5fa" />
                            {mi.matchReason && <p className="text-xs mt-2 leading-relaxed" style={{ color: '#666' }}>{mi.matchReason}</p>}

                            <div className="mt-3 space-y-2">
                              <button onClick={() => handleSend(mi, c.title.split(' — ')[0])} className="btn-primary text-sm" style={{ background: copiedId === mi.influencerId ? '#4ade80' : '#60a5fa', color: '#0a0a0a' }}>
                                <Send size={12} />{copiedId === mi.influencerId ? 'DM Copied!' : 'Send Outreach'}
                              </button>
                              {copiedId === mi.influencerId && (
                                <div className="p-3 rounded-lg relative" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                  <button onClick={() => setCopiedId(null)} className="absolute top-2 right-2 hover:opacity-70" style={{ color: '#555' }}>✕</button>
                                  <p className="text-xs pr-4" style={{ color: '#4ade80' }}>✓ Custom DM copied to clipboard. Paste it into Instagram.</p>
                                  {inf.email && (
                                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(74,222,128,0.15)' }}>
                                      <p className="text-xs mb-1" style={{ color: '#555' }}>Or reach out via email:</p>
                                      <a href={`mailto:${inf.email}`} className="text-xs font-mono hover:opacity-70" style={{ color: '#60a5fa' }}>{inf.email}</a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
