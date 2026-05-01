import { useNavigate } from 'react-router-dom'
import { Zap, Users, Building2, Briefcase } from 'lucide-react'

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
          The intelligent influencer matching platform.
        </p>
        {/* Ablant Co branding */}
        <p className="text-xs mt-2" style={{ color: '#333' }}>A product of The Ablant Co.</p>
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

      {/* Hidden admin link */}
      <p className="mt-10 text-xs" style={{ color: '#222' }}>
        <button onClick={() => navigate('/admin/login')} className="hover:opacity-50 transition-opacity" style={{ color: '#2a2a2a' }}>
          Platform admin
        </button>
      </p>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs" style={{ color: '#2a2a2a' }}>© {new Date().getFullYear()} The Ablant Co. · All rights reserved</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <button onClick={() => navigate('/privacy')} className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#333' }}>Privacy Policy</button>
          <button onClick={() => navigate('/terms')} className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#333' }}>Terms of Service</button>
        </div>
      </div>
    </div>
  )
}
