import { Shield, Clock } from 'lucide-react'

export default function InfluencerConnect() {
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
        Connect Accounts
      </h1>
      <p className="text-sm mb-7" style={{ color: '#555' }}>
        Your public profile is already being tracked automatically. Account connection unlocks deeper insights.
      </p>

      <div className="max-w-lg space-y-4">

        <div className="card p-4" style={{ borderColor: 'rgba(45,212,191,0.2)', background: 'rgba(45,212,191,0.03)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#2dd4bf' }}>
            ✓ Public data is already being tracked
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#666' }}>
            MatFluenca automatically tracks your public Instagram metrics — follower count,
            engagement rate, and audience authenticity score — every 24 hours.
            No connection required for this data.
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold" style={{ color: '#ccc' }}>Instagram</p>
              <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                Direct account connection coming soon
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <Clock size={12} style={{ color: '#fbbf24' }} />
              <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>Coming Soon</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#888' }}>Available now</p>
              {['Follower count', 'Engagement rate', 'Audience quality score', 'Campaign matching'].map(item => (
                <div key={item} className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: '#4ade80', fontSize: 10 }}>✓</span>
                  <span className="text-xs" style={{ color: '#666' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(45,212,191,0.03)', border: '1px solid rgba(45,212,191,0.1)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#2dd4bf' }}>When connected</p>
              {['Real-time reach data', 'Story impressions', 'Audience demographics', 'Post-level performance'].map(item => (
                <div key={item} className="flex items-center gap-1.5 mb-1">
                  <Clock size={10} style={{ color: '#2dd4bf' }} />
                  <span className="text-xs" style={{ color: '#555' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between" style={{ opacity: 0.4 }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ccc' }}>TikTok</p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>Coming soon</p>
          </div>
          <span className="badge-amber">Soon</span>
        </div>

        <div className="card p-4 flex items-center justify-between" style={{ opacity: 0.4 }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ccc' }}>YouTube</p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>Coming soon</p>
          </div>
          <span className="badge-amber">Soon</span>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={12} style={{ color: '#555' }} />
            <p className="text-xs font-semibold" style={{ color: '#666' }}>Privacy</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#444' }}>
            We only access publicly available data. We never post or interact with your account.
            You can request deletion of your data at any time from your Settings page.
          </p>
        </div>

      </div>
    </div>
  )
}
