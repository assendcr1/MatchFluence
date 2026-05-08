import { useNavigate } from 'react-router-dom'
import { Zap, Users, Building2, Briefcase, BarChart3, Shield, Globe, ChevronRight, Star, TrendingUp, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

const stats = [
  { value: '57+', label: 'African Influencers' },
  { value: '13', label: 'Content Niches' },
  { value: '5', label: 'African Markets' },
  { value: '95%', label: 'Match Accuracy' },
]

const steps = [
  { icon: Search, title: 'Define Your Brief', desc: 'Tell us your campaign goals, target audience, and platform. Takes 60 seconds.' },
  { icon: BarChart3, title: 'AI Matching Engine', desc: 'Our algorithm scores thousands of signals — engagement, authenticity, audience fit — to surface the best matches.' },
  { icon: Shield, title: 'Verified Results', desc: 'Every match comes with a bot score, engagement rate, and AI-generated reasoning. No guesswork.' },
  { icon: TrendingUp, title: 'Track Performance', desc: 'Monitor campaign results and build a roster of proven influencer partners.' },
]

const features = [
  { icon: Globe, color: '#2dd4bf', title: 'Africa-First', desc: 'Built specifically for African markets. SA, Nigeria, Kenya, Ghana and beyond.' },
  { icon: Shield, color: '#60a5fa', title: 'Bot Detection', desc: 'Every influencer is scored for audience authenticity. Know exactly what you\'re paying for.' },
  { icon: BarChart3, color: '#c084fc', title: 'Real-Time Data', desc: 'Follower counts and engagement rates refreshed automatically. Always accurate.' },
  { icon: Star, color: '#f59e0b', title: 'AI Reasoning', desc: 'Every match comes with an explanation. Justify your influencer spend to any stakeholder.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1a1a1a' : 'none',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        padding: '16px 32px'
      }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)' }}>
              <Zap size={15} style={{ color: '#2dd4bf' }} />
            </div>
            <span className="font-bold text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/brand/login')} className="text-sm px-4 py-2 rounded-lg transition-all" style={{ color: '#888', border: '1px solid #222' }}>Sign in</button>
            <button onClick={() => navigate('/brand/login')} className="text-sm px-4 py-2 rounded-lg font-medium transition-all" style={{ background: '#2dd4bf', color: '#0a0a0a' }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.08) 0%, transparent 60%)',
        minHeight: '100vh'
      }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Africa's First Intelligent Influencer Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif', maxWidth: '800px' }}>
          Find the right<br />
          <span style={{ color: '#2dd4bf' }}>influencer</span> for<br />
          every campaign
        </h1>
        <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#666' }}>
          MatchFluence uses data and AI to connect brands with authentic African influencers. No more guesswork, no more wasted budgets.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button onClick={() => navigate('/brand/login')} className="px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:opacity-90" style={{ background: '#2dd4bf', color: '#0a0a0a' }}>
            Start Matching <ChevronRight size={16} />
          </button>
          <button onClick={() => navigate('/influencer/login')} className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all" style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid #222' }}>
            I'm an Influencer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 w-full max-w-3xl">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}>
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#2dd4bf' }}>{value}</p>
              <p className="text-xs" style={{ color: '#555' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid #111' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#2dd4bf' }}>How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>From brief to match in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
                  <Icon size={15} style={{ color: '#2dd4bf' }} />
                </div>
                <div className="absolute top-4 right-4 text-4xl font-bold" style={{ color: '#1a1a1a', fontFamily: 'Syne, sans-serif' }}>0{i + 1}</div>
                <p className="font-semibold text-white mb-2 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(96,165,250,0.04) 0%, transparent 60%)', borderTop: '1px solid #111' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Intelligence built for Africa</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid #111' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#c084fc' }}>Who It's For</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Built for every side of the industry</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: 'Brands', icon: Building2, color: '#60a5fa', desc: 'Launch campaigns with confidence. Find influencers that match your audience, budget, and goals — backed by data.', path: '/brand/login' },
              { role: 'Agencies', icon: Briefcase, color: '#c084fc', desc: 'Win more clients and justify every spend. Access intelligence-grade tools built for agency workflows.', path: '/agency/login' },
              { role: 'Influencers', icon: Users, color: '#2dd4bf', desc: 'Get discovered by the right brands. Connect your account and let your authentic metrics speak for themselves.', path: '/influencer/login' },
            ].map(({ role, icon: Icon, color, desc, path }) => (
              <div key={role} className="p-6 rounded-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{role}</p>
                <p className="text-xs leading-relaxed mb-6 flex-1" style={{ color: '#555' }}>{desc}</p>
                <button onClick={() => navigate(path)} className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color }}>
                  Get Started <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24" style={{ borderTop: '1px solid #111' }}>
        <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.1) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(45,212,191,0.15)' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Ready to find your match?</h2>
          <p className="mb-8 text-sm" style={{ color: '#666' }}>Join the platform that's changing how African brands connect with creators.</p>
          <button onClick={() => navigate('/brand/login')} className="px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto transition-all hover:opacity-90" style={{ background: '#2dd4bf', color: '#0a0a0a' }}>
            Start for Free <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: '1px solid #111' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
              <Zap size={12} style={{ color: '#2dd4bf' }} />
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</span>
            <span className="text-xs" style={{ color: '#333' }}>· A product of The Ablant Co.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy')} className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#444' }}>Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#444' }}>Terms of Service</button>
            <button onClick={() => navigate('/admin/login')} className="text-xs hover:opacity-50 transition-opacity" style={{ color: '#1a1a1a' }}>Admin</button>
          </div>
          <p className="text-xs" style={{ color: '#333' }}>© {new Date().getFullYear()} The Ablant Co.</p>
        </div>
      </footer>
    </div>
  )
}
