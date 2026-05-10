import { useNavigate } from 'react-router-dom'
import { Zap, Users, Building2, Briefcase, BarChart3, Shield, Globe, ChevronRight, Star, TrendingUp, Search, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const stats = [
  { value: '500+', label: 'African Influencers' },
  { value: '13', label: 'Content Niches' },
  { value: '5', label: 'African Markets' },
  { value: '95%', label: 'Match Accuracy' },
]

const floatingAvatars = [
  { img: 'https://images.pexels.com/photos/6333688/pexels-photo-6333688.jpeg', name: 'Lifestyle', followers: '394K', top: '12%', left: '-8%' },
  { img: 'https://images.pexels.com/photos/2853592/pexels-photo-2853592.jpeg', name: 'Fashion', followers: '1.2M', top: '6%', right: '-6%' },
  { img: 'https://images.pexels.com/photos/6763564/pexels-photo-6763564.jpeg', name: 'Beauty', followers: '867K', bottom: '30%', left: '-10%' },
  { img: 'https://images.pexels.com/photos/8367605/pexels-photo-8367605.jpeg', name: 'Fitness', followers: '265K', bottom: '22%', right: '-8%' },
  { img: 'https://images.pexels.com/photos/6593724/pexels-photo-6593724.jpeg', name: 'Food', followers: '128K', top: '44%', right: '-7%' },
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

const portals = [
  {
    role: 'Brand',
    icon: Building2,
    color: '#60a5fa',
    gradient: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.2)',
    path: '/brand/login',
    tagline: 'Launch smarter campaigns',
    desc: 'Access Africa\'s largest verified influencer database. Run AI-powered matches, track ROI, and manage campaigns — all in one place.',
    bullets: ['AI-powered influencer matching', 'Bot score & engagement analytics', 'Campaign management tools', 'PDF export for stakeholders'],
  },
  {
    role: 'Agency',
    icon: Briefcase,
    color: '#c084fc',
    gradient: 'rgba(192,132,252,0.08)',
    border: 'rgba(192,132,252,0.2)',
    path: '/agency/login',
    tagline: 'Win clients. Justify budgets.',
    desc: 'Intelligence-grade tools built for agency workflows. Manage multiple brand clients, access deep analytics, and generate professional reports.',
    bullets: ['Multi-client management', 'Influencer database access', 'Deep analytics & insights', 'White-label ready reports'],
  },
  {
    role: 'Influencer',
    icon: Users,
    color: '#2dd4bf',
    gradient: 'rgba(45,212,191,0.08)',
    border: 'rgba(45,212,191,0.2)',
    path: '/influencer/login',
    tagline: 'Get discovered by top brands',
    desc: 'Connect your Instagram account and let your authentic metrics do the talking. Get matched with brands that align with your audience and content.',
    bullets: ['Automatic metric tracking', 'Campaign invitations from brands', 'Performance dashboard', 'Africa\'s top brand partnerships'],
  },
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
    <>
      {/* Mobile block */}
      <div className="md:hidden min-h-screen flex flex-col items-center justify-center text-center px-8" style={{ background: '#0a0a0a' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)' }}>
          <Zap size={22} style={{ color: '#2dd4bf' }} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</h1>
        <p className="text-sm leading-relaxed mb-2" style={{ color: '#555' }}>
          Please move to desktop to get the full experience.
        </p>
        <p className="text-xs" style={{ color: '#333' }}>MatchFluence is optimised for desktop browsers.</p>
      </div>

      {/* Desktop only */}
      <div className="hidden md:block min-h-screen" style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
          background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
          borderBottom: scrolled ? '1px solid #1a1a1a' : 'none',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          padding: '16px 40px'
        }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)' }}>
                <Zap size={15} style={{ color: '#2dd4bf' }} />
              </div>
              <span className="font-bold text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/influencer/login')} className="text-sm px-4 py-2 rounded-lg transition-all hover:text-white" style={{ color: '#888' }}>Influencer Login</button>
              <button onClick={() => navigate('/agency/login')} className="text-sm px-4 py-2 rounded-lg transition-all hover:text-white" style={{ color: '#888' }}>Agency Login</button>
              <button onClick={() => navigate('/brand/login')} className="text-sm px-4 py-2 rounded-lg font-medium" style={{ background: '#2dd4bf', color: '#0a0a0a' }}>Brand Login</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden" style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 50%, rgba(45,212,191,0.06) 0%, transparent 60%)', paddingTop: '80px' }}>
          <div className="max-w-7xl mx-auto px-10 pt-16 pb-16 flex items-center gap-16">
            {/* Left */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Africa's First Intelligent Influencer Platform
              </div>
              <h1 className="text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Find the right<br />
                <span style={{ color: '#2dd4bf' }}>influencer</span><br />
                for every campaign
              </h1>
              <p className="text-base mb-10 leading-relaxed" style={{ color: '#666', maxWidth: '420px' }}>
                MatchFluence uses data and AI to connect brands with authentic African influencers. No more guesswork, no more wasted budgets.
              </p>
              <div className="flex gap-3">
                <button onClick={() => navigate('/brand/login')} className="px-7 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: '#2dd4bf', color: '#0a0a0a' }}>
                  Start Matching <ChevronRight size={16} />
                </button>
                <button onClick={() => navigate('/influencer/login')} className="px-7 py-3.5 rounded-xl font-semibold text-sm hover:border-white transition-all" style={{ background: 'transparent', color: '#ccc', border: '1px solid #333' }}>
                  I'm an Influencer
                </button>
              </div>
              <div className="grid grid-cols-4 gap-6 mt-14">
                {stats.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#2dd4bf' }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#444' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative flex-shrink-0" style={{ width: '380px' }}>
              <div style={{ width: '380px', height: '520px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #222', boxShadow: '0 0 100px rgba(45,212,191,0.08)', position: 'relative' }}>
                <img src="https://images.pexels.com/photos/7676409/pexels-photo-7676409.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Influencer" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(10,10,10,0.9)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(45,212,191,0.2)', backdropFilter: 'blur(10px)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Match Score</p>
                      <p className="text-xs mt-0.5" style={{ color: '#555' }}>Lifestyle · South Africa</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: '#2dd4bf', fontFamily: 'Syne, sans-serif' }}>94</p>
                      <p className="text-xs" style={{ color: '#555' }}>/100</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-full overflow-hidden" style={{ height: '3px', background: '#1a1a1a' }}>
                    <div style={{ width: '94%', height: '100%', background: '#2dd4bf', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* Floating avatar cards */}
              {floatingAvatars.map(({ img, name, followers, ...pos }, i) => (
                <div key={i} style={{
                  position: 'absolute', ...pos,
                  background: 'rgba(15,15,15,0.95)', borderRadius: '12px', padding: '8px 12px',
                  border: '1px solid #222', backdropFilter: 'blur(20px)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 10, whiteSpace: 'nowrap'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(45,212,191,0.3)' }}>
                    <img src={`${img}?auto=compress&cs=tinysrgb&w=80`} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white" style={{ lineHeight: 1.2 }}>{name}</p>
                    <p style={{ fontSize: '10px', color: '#2dd4bf' }}>{followers} followers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="px-10 py-6" style={{ borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: '#333' }}>TRUSTED BY BRANDS ACROSS AFRICA</p>
            <div className="flex items-center gap-2">
              {floatingAvatars.map(({ img }, i) => (
                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #0a0a0a', marginLeft: i > 0 ? '-8px' : 0 }}>
                  <img src={`${img}?auto=compress&cs=tinysrgb&w=60`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              <p className="text-xs ml-3" style={{ color: '#555' }}>500+ creators ready to match</p>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
              <span className="text-xs ml-2" style={{ color: '#555' }}>Africa-first platform</span>
            </div>
          </div>
        </section>

        {/* Portal section — big clear login cards */}
        <section className="px-10 py-28" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(45,212,191,0.03) 0%, transparent 70%)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#2dd4bf' }}>Get Started</p>
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Choose your portal</h2>
              <p className="text-sm" style={{ color: '#555' }}>MatchFluence serves three distinct user types. Select yours to get started.</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {portals.map(({ role, icon: Icon, color, gradient, border, path, tagline, desc, bullets }) => (
                <div key={role} className="relative rounded-3xl p-8 flex flex-col" style={{ background: gradient, border: `1px solid ${border}`, minHeight: '480px' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{role}</p>
                  <p className="text-sm font-medium mb-4" style={{ color }}>{tagline}</p>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#666' }}>{desc}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {bullets.map(b => (
                      <li key={b} className="flex items-center gap-2 text-xs" style={{ color: '#888' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(path)}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: color, color: '#0a0a0a' }}
                  >
                    Sign in as {role} <ArrowRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-10 py-24" style={{ borderTop: '1px solid #111' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#2dd4bf' }}>How It Works</p>
              <h2 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>From brief to match in minutes</h2>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="relative p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)' }}>
                    <Icon size={16} style={{ color: '#2dd4bf' }} />
                  </div>
                  <div className="absolute top-5 right-5 text-5xl font-bold" style={{ color: '#161616', fontFamily: 'Syne, sans-serif' }}>0{i + 1}</div>
                  <p className="font-semibold text-white mb-2 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-10 py-24" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(96,165,250,0.04) 0%, transparent 60%)', borderTop: '1px solid #111' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#60a5fa' }}>Platform Features</p>
              <h2 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Intelligence built for Africa</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-4 p-7 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#555' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-10 py-24" style={{ borderTop: '1px solid #111' }}>
          <div className="max-w-3xl mx-auto text-center p-14 rounded-3xl" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.1) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(45,212,191,0.15)' }}>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Ready to find your match?</h2>
            <p className="mb-8 text-sm" style={{ color: '#666' }}>Join the platform that's changing how African brands connect with creators.</p>
            <button onClick={() => navigate('/brand/login')} className="px-10 py-4 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity" style={{ background: '#2dd4bf', color: '#0a0a0a' }}>
              Start for Free <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-10 py-8" style={{ borderTop: '1px solid #111' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.1)' }}>
                <Zap size={12} style={{ color: '#2dd4bf' }} />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>MatchFluence</span>
              <span className="text-xs ml-1" style={{ color: '#333' }}>· A product of The Ablant Co.</span>
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
    </>
  )
}
