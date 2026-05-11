import { useState } from 'react'
import { api } from '../../services/api'
import { Search, User, BarChart3, Shield, Sparkles, X } from 'lucide-react'
import BotBadge from '../../components/BotBadge'
import ScoreBar from '../../components/ScoreBar'

export default function BrandInfluencerSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setSearched(true); setSelected(null); setSummary(null)
    try {
      const res = await api.searchInfluencers(query)
      setResults(res.data)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  const handleAnalyse = async (inf) => {
    setSelected(inf); setSummary(null); setSummaryLoading(true)
    try {
      const res = await api.getInfluencerAiSummary(inf.id)
      setSummary(res.data)
    } catch { setSummary({ summary: 'Unable to generate summary at this time.' }) }
    finally { setSummaryLoading(false) }
  }

  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne,sans-serif' }}>Influencer Search</h1>
      <p className="text-sm mb-6" style={{ color: '#555' }}>Search our database by name or handle and get an AI-powered analysis</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-xl">
        <div className="relative flex-1">
          <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#444' }} />
          <input
            className="input pl-9"
            placeholder="Search by name or handle..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-5" style={{ background: '#60a5fa', color: '#0a0a0a' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="grid grid-cols-2 gap-6">
        {/* Results list */}
        <div>
          {searched && (
            <p className="text-xs mb-3" style={{ color: '#444' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
          )}
          <div className="space-y-2">
            {results.map(inf => (
              <div
                key={inf.id}
                onClick={() => handleAnalyse(inf)}
                className="card p-4 cursor-pointer transition-all hover:border-blue-500/30"
                style={{ borderColor: selected?.id === inf.id ? 'rgba(96,165,250,0.4)' : undefined }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                      <User size={15} style={{ color: '#60a5fa' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{inf.instagramHandle || '@' + inf.displayName}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#555' }}>{inf.niche?.nicheName} · {inf.market?.marketName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#ccc' }}>{inf.followerCount?.toLocaleString()}</p>
                    <p className="text-xs" style={{ color: '#555' }}>{inf.engagementRate}% eng</p>
                  </div>
                </div>
              </div>
            ))}
            {searched && results.length === 0 && !loading && (
              <div className="card p-8 text-center">
                <p className="text-sm" style={{ color: '#555' }}>No influencers found for "{query}"</p>
                <p className="text-xs mt-1" style={{ color: '#333' }}>Try a different name or handle</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary panel */}
        <div>
          {!selected && (
            <div className="card p-8 text-center h-full flex flex-col items-center justify-center" style={{ minHeight: '200px' }}>
              <Sparkles size={24} style={{ color: '#333', marginBottom: '12px' }} />
              <p className="text-sm" style={{ color: '#555' }}>Select an influencer to get an AI-powered analysis</p>
            </div>
          )}
          {selected && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-white text-sm" style={{ fontFamily: 'Syne,sans-serif' }}>
                  {selected.instagramHandle || '@' + selected.displayName}
                </p>
                <button onClick={() => { setSelected(null); setSummary(null) }} style={{ color: '#444' }}>
                  <X size={14} />
                </button>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                  <p className="text-xs mb-1" style={{ color: '#444' }}>Followers</p>
                  <p className="text-lg font-bold text-white">{selected.followerCount?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                  <p className="text-xs mb-1" style={{ color: '#444' }}>Engagement Rate</p>
                  <p className="text-lg font-bold text-white">{selected.engagementRate}%</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                  <p className="text-xs mb-1" style={{ color: '#444' }}>Niche</p>
                  <p className="text-sm font-semibold text-white">{selected.niche?.nicheName || '—'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
                  <p className="text-xs mb-1" style={{ color: '#444' }}>Market</p>
                  <p className="text-sm font-semibold text-white">{selected.market?.marketName || '—'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: '#444' }}>Audience Authenticity</p>
                <BotBadge score={selected.botScore} />
              </div>

              <ScoreBar score={Math.round((1 - selected.botScore) * 100)} color="#3ad6c2" label="Authenticity Score" />

              {/* AI Summary */}
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} style={{ color: '#60a5fa' }} />
                  <p className="text-xs font-semibold" style={{ color: '#60a5fa' }}>AI Analysis</p>
                </div>
                {summaryLoading ? (
                  <p className="text-xs" style={{ color: '#555' }}>Generating analysis...</p>
                ) : summary ? (
                  <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{summary.summary}</p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
