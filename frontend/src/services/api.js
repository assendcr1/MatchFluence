import axios from 'axios'

const BASE = '/api'
const auth = (key) => ({ headers: { 'X-Api-Key': key } })
const bearer = (token) => ({ headers: { 'Authorization': `Bearer ${token}` } })

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
  getInfluencerAiSummary: (id) => axios.get(`${BASE}/influencer/${id}/ai-summary`),
  searchInfluencers: (query) => axios.get(`${BASE}/influencer/find?q=${encodeURIComponent(query)}`),

  // Instagram OAuth
  getInstagramAuthUrl: (influencerId) =>
    axios.get(`${BASE}/instagram/auth-url?influencerId=${influencerId}`),
  instagramCallback: (d) => axios.post(`${BASE}/instagram/callback`, d),
  getInstagramStatus: (influencerId) =>
    axios.get(`${BASE}/instagram/status/${influencerId}`),

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
  // Admin — brands & agencies
  getAllBrands: () => axios.get(`${BASE}/brand/all`),
  deleteBrand: (id) => axios.delete(`${BASE}/brand/${id}`),
  getAllAgencies: () => axios.get(`${BASE}/agency/all`),
  deleteAgency: (id) => axios.delete(`${BASE}/agency/${id}`),

  // Auth endpoints
  brandLogin: (email, password) => axios.post(`${BASE}/auth/brand/login`, { email, password }),
  brandRegister: (d) => axios.post(`${BASE}/auth/brand/register`, d),
  agencyLogin: (email, password) => axios.post(`${BASE}/auth/agency/login`, { email, password }),
  agencyRegister: (d) => axios.post(`${BASE}/auth/agency/register`, d),
  influencerLogin: (email, password) => axios.post(`${BASE}/auth/influencer/login`, { email, password }),
  influencerRegister: (d) => axios.post(`${BASE}/auth/influencer/register`, d),

  runMatch: (token, d) => axios.post(`${BASE}/match`, d, bearer(token)),
  saveCampaign: (token, d) => axios.post(`${BASE}/campaign`, d, bearer(token)),

  // Messaging
  sendMessage: (d) => axios.post(`${BASE}/messaging/send-message`, d),

  // Refresh
  refreshAll: () => axios.post(`${BASE}/refresh/all`),
  refreshOne: (id) => axios.post(`${BASE}/refresh/${id}`),
}
