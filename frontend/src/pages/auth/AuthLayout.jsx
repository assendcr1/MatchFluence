import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
export default function AuthLayout({ title, subtitle, accent = '#2dd4bf', children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-6 opacity-50 hover:opacity-100 transition-opacity">
          <Zap size={14} style={{ color: accent }} /><span className="text-sm" style={{ color: '#888' }}>MatchFluence</span>
        </button>
        <div className="card p-7">
          <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h1>
          <p className="text-sm mb-6" style={{ color: '#666' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
