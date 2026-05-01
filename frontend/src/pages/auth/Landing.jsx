import { useNavigate } from 'react-router-dom'
import { Zap, Users, Building2, Briefcase } from 'lucide-react'

// Admin portal removed from landing page — access via /admin/login directly
export default function Landing() {
  const navigate = useNavigate()
  const portals = [
    { role: 'Influencer', icon: Users, color: '#2dd4bf', desc: 'Track metrics, campaigns, and connect your social accounts', path: '/influencer/login' },
    { role: 'Brand', icon: Building2, color: '#60a5fa', desc: 'Find perfect influencers for your campaigns', path: '/brand/login' },
    { role: 'Agency', icon: Briefcase, color: '#c084fc', desc: 'Intelligence-grade tools to win clients and justify budgets', path: '/agency/login' },
  ]
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 page-fade" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.05) 0%, #0a0a0a 60%)' }}>
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
            <Zap size={18} style={{ color: '#2dd4bf' }} />
          </div>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</span>
        </div>
        <p className="text-base max-w-sm mx-auto" style={{ color: '#666' }}>
          The intelligent influencer matching platform. Choose your portal to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {portals.map(({ role, icon: Icon, color, desc, path }) => (
          <button key={role} onClick={() => navigate(path)} className="card card-hover p-6 text-left">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{role}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{desc}</p>
            <p className="text-xs mt-4 font-medium" style={{ color }}>Sign in →</p>
          </button>
        ))}
      </div>

      <p className="mt-12 text-xs" style={{ color: '#333' }}>
        Platform admin? <button onClick={() => navigate('/admin/login')} className="underline hover:opacity-70 transition-opacity" style={{ color: '#444' }}>Access here</button>
      </p>
    </div>
  )
}
