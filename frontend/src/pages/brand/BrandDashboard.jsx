import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { LayoutDashboard, PlusCircle, Megaphone, Send, Settings } from 'lucide-react'
import BrandHome from './BrandHome'
import BrandNewCampaign from './BrandNewCampaign'
import BrandCampaigns from './BrandCampaigns'
import BrandSettings from './BrandSettings'
const links = [
  {to:'/brand',icon:LayoutDashboard,label:'Home'},
  {to:'/brand/new-campaign',icon:PlusCircle,label:'New Campaign'},
  {to:'/brand/campaigns',icon:Megaphone,label:'My Campaigns'},
  {to:'/brand/settings',icon:Settings,label:'Settings'},
]
export default function BrandDashboard() {
  const { session } = useAuth(); const navigate = useNavigate()
  useEffect(()=>{if(!session||session.userType!=='Brand')navigate('/brand/login')},[session])
  if(!session)return null
  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} accentColor="blue" />
      <main className="flex-1 overflow-auto" style={{background:'#0a0a0a'}}>
        <Routes>
          <Route index element={<BrandHome />} />
          <Route path="new-campaign" element={<BrandNewCampaign />} />
          <Route path="campaigns" element={<BrandCampaigns />} />
          <Route path="settings" element={<BrandSettings />} />
        </Routes>
      </main>
    </div>
  )
}
