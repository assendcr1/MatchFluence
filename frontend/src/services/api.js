import axios from 'axios'

// In production (Vercel), VITE_API_URL is set to your Railway backend URL
// In development, proxy handles /api → localhost:5186
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const auth = (key) => ({ headers: { 'X-Api-Key': key } })

export const api = {
  // Registration
  registerBrand: (d) => axios.post(`${BASE}/brand/register`, d),
  registerAgency: (d) => axios.post(`${BASE}/agency/register`, d),
  registerInfluencer: (d) => axios.post(`${BASE}/influencer`, d),

  // Profiles
  getBrandProfile: (key) => axios.get(`${BASE}/brand/profile`, auth(key)),
  getAgencyProfile: (key) => axios.get(`${BASE}/agency/profile`, auth(key)),

  // Influencers
  getInfluencers: () => axios.get(`${BASE}/influencer`),
  getInfluencerById: (id) => axios.get(`${BASE}/influencer/${id}`),
  getInfluencerByUsername: (n) => axios.get(`${BASE}/influencer/username/${n}`),
  createInfluencer: (d) => axios.post(`${BASE}/influencer`, d),
  updateInfluencer: (id, d) => axios.put(`${BASE}/influencer/${id}`, d),
  deleteInfluencer: (id) => axios.delete(`${BASE}/influencer/${id}`),
  getInfluencerMetrics: (id) => axios.get(`${BASE}/influencer/${id}/metrics`),
  getInfluencerCampaigns: (id) => axios.get(`${BASE}/influencer/${id}/campaigns`),
  getInfluencerSummary: (id) => axios.get(`${BASE}/influencer/${id}/summary`),

  // Niches & Markets
  getNiches: () => axios.get(`${BASE}/niches`),
  getMarkets: () => axios.get(`${BASE}/markets`),
  createNiche: (d) => axios.post(`${BASE}/niches`, d),
  createMarket: (d) => axios.post(`${BASE}/markets`, d),
  deleteNiche: (id) => axios.delete(`${BASE}/niches/${id}`),
  deleteMarket: (id) => axios.delete(`${BASE}/markets/${id}`),

  // Campaigns
  getCampaigns: () => axios.get(`${BASE}/campaign`),
  createCampaign: (d) => axios.post(`${BASE}/campaign`, d),
  deleteCampaign: (id) => axios.delete(`${BASE}/campaign/${id}`),
  getBrandCampaigns: (key) => axios.get(`${BASE}/brand/campaigns`, auth(key)),
  getAgencyCampaigns: (key) => axios.get(`${BASE}/agency/campaigns`, auth(key)),

  // Match
  runMatch: (key, d) => axios.post(`${BASE}/match`, d, auth(key)),

  // Messaging
  sendMessage: (d) => axios.post(`${BASE}/messaging/send-message`, d),

  // Refresh
  refreshAll: () => axios.post(`${BASE}/refresh/all`),
  refreshOne: (id) => axios.post(`${BASE}/refresh/${id}`),
}
