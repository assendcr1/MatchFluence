import axios from 'axios'

// Always use /api — Vercel proxies this to Railway
// This means no cross-origin requests, no CORS issues ever
const BASE = '/api'

const auth = (key) => ({ headers: { 'X-Api-Key': key } })

export const api = {
  registerBrand: (d) => axios.post(`${BASE}/brand/register`, d),
  registerAgency: (d) => axios.post(`${BASE}/agency/register`, d),
  registerInfluencer: (d) => axios.post(`${BASE}/influencer`, d),
  getBrandProfile: (key) => axios.get(`${BASE}/brand/profile`, auth(key)),
  getAgencyProfile: (key) => axios.get(`${BASE}/agency/profile`, auth(key)),
  getInfluencers: () => axios.get(`${BASE}/influencer`),
  getInfluencerById: (id) => axios.get(`${BASE}/influencer/${id}`),
  getInfluencerByUsername: (n) => axios.get(`${BASE}/influencer/username/${n}`),
  createInfluencer: (d) => axios.post(`${BASE}/influencer`, d),
  updateInfluencer: (id, d) => axios.put(`${BASE}/influencer/${id}`, d),
  deleteInfluencer: (id) => axios.delete(`${BASE}/influencer/${id}`),
  getInfluencerMetrics: (id) => axios.get(`${BASE}/influencer/${id}/metrics`),
  getInfluencerCampaigns: (id) => axios.get(`${BASE}/influencer/${id}/campaigns`),
  getInfluencerSummary: (id) => axios.get(`${BASE}/influencer/${id}/summary`),
  getNiches: () => axios.get(`${BASE}/niches`),
  getMarkets: () => axios.get(`${BASE}/markets`),
  createNiche: (d) => axios.post(`${BASE}/niches`, d),
  createMarket: (d) => axios.post(`${BASE}/markets`, d),
  deleteNiche: (id) => axios.delete(`${BASE}/niches/${id}`),
  deleteMarket: (id) => axios.delete(`${BASE}/markets/${id}`),
  getCampaigns: () => axios.get(`${BASE}/campaign`),
  createCampaign: (d) => axios.post(`${BASE}/campaign`, d),
  deleteCampaign: (id) => axios.delete(`${BASE}/campaign/${id}`),
  getBrandCampaigns: (key) => axios.get(`${BASE}/brand/campaigns`, auth(key)),
  getAgencyCampaigns: (key) => axios.get(`${BASE}/agency/campaigns`, auth(key)),
  runMatch: (key, d) => axios.post(`${BASE}/match`, d, auth(key)),
  sendMessage: (d) => axios.post(`${BASE}/messaging/send-message`, d),
  refreshAll: () => axios.post(`${BASE}/refresh/all`),
  refreshOne: (id) => axios.post(`${BASE}/refresh/${id}`),
}
