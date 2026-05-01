import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { LayoutDashboard, BarChart2, Megaphone, Link2, Settings } from 'lucide-react'
import InfluencerHome from './InfluencerHome'
import InfluencerMetrics from './InfluencerMetrics'
import InfluencerCampaigns from './InfluencerCampaigns'
import InfluencerConnect from './InfluencerConnect'
import InfluencerSettings from './InfluencerSettings'
const links = [
  { to:'/influencer', icon:LayoutDashboard, label:'Overview' },
  { to:'/influencer/metrics', icon:BarChart2, label:'Metrics' },
  { to:'/influencer/campaigns', icon:Megaphone, label:'Campaigns' },
  { to:'/influencer/connect', icon:Link2, label:'Connect Accounts' },
  { to:'/influencer/settings', icon:Settings, label:'Settings' },
]
export default function InfluencerDashboard() {
  const { session } = useAuth(); const navigate = useNavigate()
  useEffect(() => { if (!session || session.userType !== 'Influencer') navigate('/influencer/login') }, [session])
  if (!session) return null
  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} accentColor="teal" />
      <main className="flex-1 overflow-auto" style={{background:'#0a0a0a'}}>
        <Routes>
          <Route index element={<InfluencerHome />} />
          <Route path="metrics" element={<InfluencerMetrics />} />
          <Route path="campaigns" element={<InfluencerCampaigns />} />
          <Route path="connect" element={<InfluencerConnect />} />
          <Route path="settings" element={<InfluencerSettings />} />
        </Routes>
      </main>
    </div>
  )
}
