import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Zap } from 'lucide-react'

export default function Sidebar({ links, accentColor = 'teal' }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const colors = { teal: '#2dd4bf', blue: '#60a5fa', purple: '#c084fc', amber: '#fbbf24' }
  const accent = colors[accentColor] || '#2dd4bf'

  return (
    <div className="w-56 min-h-screen flex flex-col flex-shrink-0" style={{ background: '#0d0d0d', borderRight: '1px solid #1a1a1a' }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-ink-700">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} style={{ color: accent }} />
          <span className="font-bold text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</span>
        </div>
        {session && (
          <div>
            <p className="text-xs font-medium" style={{ color: accent }}>{session.userType}</p>
            <p className="text-sm font-medium text-gray-300 truncate">{session.name}</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) => `sidebar-link ${isActive ? 'text-white' : ''}`}
            style={({ isActive }) => isActive ? { background: `${accent}15`, color: accent } : {}}
          >
            <Icon size={15} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer — branding + sign out */}
      <div className="px-3 pb-4">
        <div className="px-2 py-3 border-t border-ink-700">
          <button
            onClick={() => { logout(); navigate('/') }}
            className="sidebar-link w-full"
            style={{ color: '#f87171' }}
          >
            <LogOut size={15} /><span>Sign out</span>
          </button>
        </div>
        {/* Ablant Co. branding */}
        <div className="px-2 pt-2 pb-1">
          <p className="text-xs" style={{ color: '#2a2a2a', letterSpacing: '0.03em' }}>A product of</p>
          <p className="text-xs font-semibold" style={{ color: '#333', letterSpacing: '0.05em' }}>The Ablant Co.</p>
        </div>
      </div>
    </div>
  )
}
