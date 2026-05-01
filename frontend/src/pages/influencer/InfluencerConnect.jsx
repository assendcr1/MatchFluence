import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { CheckCircle, Instagram, Loader } from 'lucide-react'

export default function InfluencerConnect() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState(null) // null, 'connected', 'loading', 'error'
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [tokenExpiry, setTokenExpiry] = useState(null)

  // Check if this is a callback from Instagram OAuth
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('Instagram authorization was denied. Please try again.')
      return
    }

    if (code && state) {
      handleOAuthCallback(code, state)
      return
    }

    // Check current connection status
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const res = await api.getInstagramStatus(session.id)
      if (res.data.isConnected) {
        setStatus('connected')
        setTokenExpiry(res.data.tokenExpiry)
      }
    } catch {
      // Not connected yet — that's fine
    }
  }

  const handleOAuthCallback = async (code, state) => {
    setStatus('loading')
    try {
      const res = await api.instagramCallback({ code, state })
      setStatus('connected')
      setTokenExpiry(res.data.tokenExpiry)
      // Clean URL
      navigate('/influencer/connect', { replace: true })
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.message || 'Connection failed. Please try again.')
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    setError('')
    try {
      const res = await api.getInstagramAuthUrl(session.id)
      // Redirect to Instagram authorization page
      window.location.href = res.data.authUrl
    } catch (err) {
      setError('Could not start Instagram connection. Please try again.')
      setConnecting(false)
    }
  }

  const daysUntilExpiry = tokenExpiry
    ? Math.ceil((new Date(tokenExpiry) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
        Connect Accounts
      </h1>
      <p className="text-sm mb-7" style={{ color: '#555' }}>
        Link your social accounts for richer data and better match accuracy
      </p>

      <div className="max-w-lg space-y-3">

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            {error}
          </div>
        )}

        {/* Instagram */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
                <Instagram size={16} style={{ color: '#2dd4bf' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#ccc' }}>Instagram</p>
                <p className="text-sm mt-0.5" style={{ color: '#555' }}>
                  {status === 'connected'
                    ? `Connected · token expires in ${daysUntilExpiry} days`
                    : 'Unlock real reach, engagement, and audience insights'}
                </p>
              </div>
            </div>

            {status === 'loading' ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#2dd4bf' }}>
                <Loader size={14} className="animate-spin" />
                Connecting...
              </div>
            ) : status === 'connected' ? (
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: '#4ade80' }} />
                <span className="badge-green">Connected</span>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="btn-primary text-sm"
                style={{ background: '#2dd4bf' }}
              >
                {connecting ? 'Redirecting...' : 'Connect Instagram'}
              </button>
            )}
          </div>

          {status === 'connected' && (
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #1a1a1a' }}>
              <p className="text-xs font-medium" style={{ color: '#888' }}>What we can now access:</p>
              {[
                'Real follower count and growth trends',
                'Actual engagement rate from your last 10 posts',
                'Audience authenticity score',
                'Account reach and impressions',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={11} style={{ color: '#4ade80' }} />
                  <span className="text-xs" style={{ color: '#666' }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TikTok — coming soon */}
        <div className="card p-5 flex items-center justify-between" style={{ opacity: 0.5 }}>
          <div>
            <p className="font-semibold" style={{ color: '#ccc' }}>TikTok</p>
            <p className="text-sm mt-0.5" style={{ color: '#555' }}>Coming soon</p>
          </div>
          <span className="badge-amber">Soon</span>
        </div>

        {/* YouTube — coming soon */}
        <div className="card p-5 flex items-center justify-between" style={{ opacity: 0.5 }}>
          <div>
            <p className="font-semibold" style={{ color: '#ccc' }}>YouTube</p>
            <p className="text-sm mt-0.5" style={{ color: '#555' }}>Coming soon</p>
          </div>
          <span className="badge-amber">Soon</span>
        </div>

        <div className="card p-4" style={{ borderColor: 'rgba(45,212,191,0.15)' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#555' }}>
            Connecting your accounts gives MatchFluence read-only access to your public metrics.
            We never post on your behalf. Your token is stored securely and expires after 60 days,
            after which you'll be prompted to reconnect.
          </p>
        </div>
      </div>
    </div>
  )
}
