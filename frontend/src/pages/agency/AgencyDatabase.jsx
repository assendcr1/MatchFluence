import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import BotBadge from '../../components/BotBadge'
import ScoreBar from '../../components/ScoreBar'
import { Search, RefreshCw, Sparkles, X } from 'lucide-react'

export default function AgencyDatabase() {
  const [influencers, setInfluencers] = useState([])
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ nicheId: '', marketId: '', minFollowers: '', maxFollowers: '', minEngagement: '', maxBotScore: '' })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    Promise.all([api.getInfluencers(), api.getNiches(), api.getMarkets()])
      .then(([i, n, m]) => { setInfluencers(i.data); setNiches(n.data); setMarkets(m.data) })
      .finally(() => setLoading(false))
  }, [])

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  const filtered = influencers.filter(inf => {
    if (search && !inf.displayName?.toLowerCase().includes(search.toLowerCase()) &&
      !inf.instagramHandle?.toLowerCase().includes(search.toLowerCase()) &&
      !inf.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.nicheId && inf.nicheId !== parseInt(filters.nicheId)) return false
    if (filters.marketId && inf.marketId !== parseInt(filters.marketId)) return false
    if (filters.minFollowers && inf.followerCount < parseInt(filters.minFollowers)) return false
    if (filters.maxFollowers && inf.followerCount > parseInt(filters.maxFollowers)) return false
    if (filters.minEngagement && inf.engagementRate < parseFloat(filters.minEngagement)) return false
    if (filters.maxBotScore && inf.botScore > parseFloat(filters.maxBotScore)) return false
    return true
  })

  const handleAnalyse = async (inf) => {
    setSelected(inf); setSummary(null); setSummaryLoading(true)
    try {
      const res = await api.getInfluencerAiSummary(inf.id)
      setSummary(res.data)
    } catch { setSummary({ summary: 'Unable to generate summary at this time.' }) }
    finally { setSummaryLoading(false) }
  }

  if (loading) return <Loader />

  return (
    <div className="p-7 page-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Influencer Database</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>{filtered.length} of {influencers.length} influencers</p>
        </div>
        <button onClick={() => api.refreshAll().then(() => alert('Refresh triggered.'))} className="btn-secondary text-sm flex items-center gap-1.5">
          <RefreshCw size={12} /> Refresh All
        </button>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left — filters + table */}
        <div className="flex flex-col min-w-0" style={{ flex: selected ? '1 1 60%' : '1 1 100%', transition: 'flex 0.2s' }}>

          {/* Filters */}
          <div className="card p-4 mb-4 flex-shrink-0">
            <div className="relative mb-2">
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
              <input className="input w-full" style={{ paddingLeft: '32px' }} placeholder="Search by name or handle..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select className="input text-sm" value={filters.nicheId} onChange={e => setF('nicheId', e.target.value)}>
                <option value="">All niches</option>{niches.map(n => <option key={n.id} value={n.id}>{n.nicheName}</option>)}
              </select>
              <select className="input text-sm" value={filters.marketId} onChange={e => setF('marketId', e.target.value)}>
                <option value="">All markets</option>{markets.map(m => <option key={m.id} value={m.id}>{m.marketName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input className="input text-sm" type="number" placeholder="Min followers" value={filters.minFollowers} onChange={e => setF('minFollowers', e.target.value)} />
              <input className="input text-sm" type="number" placeholder="Max followers" value={filters.maxFollowers} onChange={e => setF('maxFollowers', e.target.value)} />
              <input className="input text-sm" type="number" step="0.1" placeholder="Min eng %" value={filters.minEngagement} onChange={e => setF('minEngagement', e.target.value)} />
              <input className="input text-sm" type="number" step="0.05" placeholder="Max bots" value={filters.maxBotScore} onChange={e => setF('maxBotScore', e.target.value)} />
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden flex-1 overflow-y-auto">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#0f0f0f', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '30%' }}>Influencer</th>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '15%' }}>Niche</th>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '15%' }}>Market</th>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '12%' }}>Followers</th>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '10%' }}>Eng %</th>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '10%' }}>Bots</th>
                  <th className="text-left px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: '#444', width: '8%' }}>AI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inf => (
                  <tr key={inf.id} className="table-row" style={{ borderBottom: '1px solid #111', background: selected?.id === inf.id ? 'rgba(192,132,252,0.05)' : 'transparent' }}>
                    <td className="px-4 py-3" style={{ overflow: 'hidden' }}>
                      <p className="text-sm font-medium truncate" style={{ color: '#ccc' }}>{inf.instagramHandle || '@' + inf.displayName}</p>
                      <p className="text-xs truncate" style={{ color: '#444' }}>{inf.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs truncate block" style={{ color: '#888' }}>{inf.niche?.nicheName || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs truncate block" style={{ color: '#888' }}>{inf.market?.marketName || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#ccc' }}>{inf.followerCount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#ccc' }}>{inf.engagementRate}%</td>
                    <td className="px-4 py-3"><BotBadge score={inf.botScore} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleAnalyse(inf)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors hover:bg-purple-500/10 whitespace-nowrap"
                        style={{ color: '#c084fc', border: '1px solid rgba(192,132,252,0.2)' }}>
                        <Sparkles size={10} /> AI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-10 text-sm" style={{ color: '#444' }}>No influencers match your filters.</div>}
          </div>
        </div>

        {/* Right — AI analysis panel */}
        {selected && (
          <div style={{ width: '320px', flexShrink: 0 }}>
            <div className="card p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-white text-sm truncate pr-2" style={{ fontFamily: 'Syne,sans-serif' }}>
                  {selected.instagramHandle || '@' + selected.displayName}
                </p>
                <button onClick={() => { setSelected(null); setSummary(null) }} className="flex-shrink-0 hover:opacity-70" style={{ color: '#555' }}>
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Followers', value: selected.followerCount?.toLocaleString() },
                  { label: 'Engagement', value: selected.engagementRate + '%' },
                  { label: 'Niche', value: selected.niche?.nicheName || '—' },
                  { label: 'Market', value: selected.market?.marketName || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                    <p className="text-xs mb-0.5" style={{ color: '#444' }}>{label}</p>
                    <p className="text-sm font-semibold text-white truncate">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <p className="text-xs mb-1.5" style={{ color: '#444' }}>Audience Authenticity</p>
                <BotBadge score={selected.botScore} />
              </div>

              <ScoreBar score={Math.round((1 - selected.botScore) * 100)} color="#3ad6c2" />

              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} style={{ color: '#c084fc' }} />
                  <p className="text-xs font-semibold" style={{ color: '#c084fc' }}>AI Analysis</p>
                </div>
                {summaryLoading
                  ? <p className="text-xs" style={{ color: '#555' }}>Generating analysis...</p>
                  : summary
                    ? <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{summary.summary}</p>
                    : null
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
