import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { Brain, Megaphone, Database, BarChart2, FileText, Settings } from 'lucide-react'
import AgencyIntelligence from './AgencyIntelligence'
import AgencyCampaigns from './AgencyCampaigns'
import AgencyDatabase from './AgencyDatabase'
import AgencyAnalytics from './AgencyAnalytics'
import AgencyReports from './AgencyReports'
import AgencySettings from './AgencySettings'
const links = [
  {to:'/agency',icon:Brain,label:'Intelligence'},
  {to:'/agency/campaigns',icon:Megaphone,label:'Campaigns'},
  {to:'/agency/database',icon:Database,label:'Influencer DB'},
  {to:'/agency/analytics',icon:BarChart2,label:'Analytics'},
  {to:'/agency/reports',icon:FileText,label:'Reports'},
  {to:'/agency/settings',icon:Settings,label:'Settings'},
]
export default function AgencyDashboard() {
  const { session } = useAuth(); const navigate = useNavigate()
  useEffect(()=>{if(!session||session.userType!=='Agency')navigate('/agency/login')},[session])
  if(!session)return null
  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} accentColor="purple" />
      <main className="flex-1 overflow-auto" style={{background:'#0a0a0a'}}>
        <Routes>
          <Route index element={<AgencyIntelligence />} />
          <Route path="campaigns" element={<AgencyCampaigns />} />
          <Route path="database" element={<AgencyDatabase />} />
          <Route path="analytics" element={<AgencyAnalytics />} />
          <Route path="reports" element={<AgencyReports />} />
          <Route path="settings" element={<AgencySettings />} />
        </Routes>
      </main>
    </div>
  )
}
