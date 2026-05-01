import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { LayoutDashboard, Users, Building2, Briefcase, Globe } from 'lucide-react'
import AdminHome from './AdminHome'
import AdminInfluencers from './AdminInfluencers'
import AdminBrands from './AdminBrands'
import AdminAgencies from './AdminAgencies'
import AdminNichesMarkets from './AdminNichesMarkets'
const links = [
  {to:'/admin',icon:LayoutDashboard,label:'Overview'},
  {to:'/admin/influencers',icon:Users,label:'Influencers'},
  {to:'/admin/brands',icon:Building2,label:'Brands'},
  {to:'/admin/agencies',icon:Briefcase,label:'Agencies'},
  {to:'/admin/niches-markets',icon:Globe,label:'Niches & Markets'},
]
export default function AdminDashboard() {
  const { session } = useAuth(); const navigate = useNavigate()
  useEffect(()=>{if(!session||session.userType!=='Admin')navigate('/admin/login')},[session])
  if(!session)return null
  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} accentColor="amber" />
      <main className="flex-1 overflow-auto" style={{background:'#0a0a0a'}}>
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="influencers" element={<AdminInfluencers />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="agencies" element={<AdminAgencies />} />
          <Route path="niches-markets" element={<AdminNichesMarkets />} />
        </Routes>
      </main>
    </div>
  )
}
