import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/auth/Landing'
import InfluencerAuth from './pages/auth/InfluencerAuth'
import BrandAuth from './pages/auth/BrandAuth'
import AgencyAuth from './pages/auth/AgencyAuth'
import AdminAuth from './pages/auth/AdminAuth'
import InfluencerDashboard from './pages/influencer/InfluencerDashboard'
import BrandDashboard from './pages/brand/BrandDashboard'
import AgencyDashboard from './pages/agency/AgencyDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/influencer/login" element={<InfluencerAuth />} />
      <Route path="/brand/login" element={<BrandAuth />} />
      <Route path="/agency/login" element={<AgencyAuth />} />
      <Route path="/admin/login" element={<AdminAuth />} />
      <Route path="/influencer/*" element={<InfluencerDashboard />} />
      <Route path="/brand/*" element={<BrandDashboard />} />
      <Route path="/agency/*" element={<AgencyDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
