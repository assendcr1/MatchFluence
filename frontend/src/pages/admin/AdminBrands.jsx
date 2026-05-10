import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Building2, Trash2, Plus, Mail, Globe, Briefcase } from 'lucide-react'

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ companyName: '', email: '', password: '', industry: '', website: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { loadBrands() }, [])

  const loadBrands = async () => {
    setLoading(true)
    try { const res = await api.getAllBrands(); setBrands(res.data) }
    catch { setBrands([]) }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.brandRegister({ companyName: form.companyName, email: form.email, password: form.password, industry: form.industry, website: form.website })
      setForm({ companyName: '', email: '', password: '', industry: '', website: '' })
      setShowForm(false)
      await loadBrands()
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    try { await api.deleteBrand(id); await loadBrands() }
    catch { alert('Failed to delete.') }
  }

  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Brands</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>{brands.length} registered brand{brands.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError('') }} className="btn-primary text-sm flex items-center gap-2" style={{ background: '#fbbf24', color: '#0a0a0a' }}>
          <Plus size={14} /> Register Brand
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <p className="font-semibold text-white mb-4">Register New Brand</p>
          {error && <div className="mb-3 p-3 rounded text-xs" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</div>}
          <form onSubmit={handleRegister} className="grid grid-cols-2 gap-3">
            <div><label className="label">Company Name</label><input className="input text-sm" placeholder="Nike SA" value={form.companyName} onChange={e => set('companyName', e.target.value)} required /></div>
            <div><label className="label">Email</label><input className="input text-sm" type="email" placeholder="brand@company.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
            <div><label className="label">Password</label><input className="input text-sm" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
            <div><label className="label">Industry</label><input className="input text-sm" placeholder="Fashion" value={form.industry} onChange={e => set('industry', e.target.value)} /></div>
            <div><label className="label">Website</label><input className="input text-sm" placeholder="brand.com" value={form.website} onChange={e => set('website', e.target.value)} /></div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="btn-primary text-sm" style={{ background: '#fbbf24', color: '#0a0a0a' }}>
                {saving ? 'Registering...' : 'Register Brand'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12" style={{ color: '#555' }}>Loading brands...</div>
      ) : brands.length === 0 ? (
        <div className="card p-10 text-center">
          <Building2 size={24} style={{ color: '#333', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: '#555' }}>No brands registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {brands.map(b => (
            <div key={b.id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <Building2 size={16} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{b.companyName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#555' }}><Mail size={10} />{b.email}</span>
                    {b.industry && <span className="flex items-center gap-1 text-xs" style={{ color: '#555' }}><Briefcase size={10} />{b.industry}</span>}
                    {b.website && <span className="flex items-center gap-1 text-xs" style={{ color: '#555' }}><Globe size={10} />{b.website}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs" style={{ color: '#333' }}>{new Date(b.createdAt).toLocaleDateString('en-ZA')}</p>
                <button onClick={() => handleDelete(b.id, b.companyName)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#555' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
