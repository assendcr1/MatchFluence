import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Briefcase, Trash2, Plus, Mail, Globe } from 'lucide-react'

export default function AdminAgencies() {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ agencyName: '', email: '', password: '', website: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { loadAgencies() }, [])

  const loadAgencies = async () => {
    setLoading(true)
    try { const res = await api.getAllAgencies(); setAgencies(res.data) }
    catch { setAgencies([]) }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.agencyRegister({ agencyName: form.agencyName, email: form.email, password: form.password, website: form.website })
      setForm({ agencyName: '', email: '', password: '', website: '' })
      setShowForm(false)
      await loadAgencies()
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    try { await api.deleteAgency(id); await loadAgencies() }
    catch { alert('Failed to delete.') }
  }

  return (
    <div className="p-7 page-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Agencies</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>{agencies.length} registered agenc{agencies.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError('') }} className="btn-primary text-sm flex items-center gap-2" style={{ background: '#fbbf24', color: '#0a0a0a' }}>
          <Plus size={14} /> Register Agency
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <p className="font-semibold text-white mb-4">Register New Agency</p>
          {error && <div className="mb-3 p-3 rounded text-xs" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</div>}
          <form onSubmit={handleRegister} className="grid grid-cols-2 gap-3">
            <div><label className="label">Agency Name</label><input className="input text-sm" placeholder="Creative Agency" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} required /></div>
            <div><label className="label">Email</label><input className="input text-sm" type="email" placeholder="hello@agency.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
            <div><label className="label">Password</label><input className="input text-sm" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
            <div><label className="label">Website</label><input className="input text-sm" placeholder="agency.com" value={form.website} onChange={e => set('website', e.target.value)} /></div>
            <div className="flex items-end col-span-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm" style={{ background: '#fbbf24', color: '#0a0a0a' }}>
                {saving ? 'Registering...' : 'Register Agency'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12" style={{ color: '#555' }}>Loading agencies...</div>
      ) : agencies.length === 0 ? (
        <div className="card p-10 text-center">
          <Briefcase size={24} style={{ color: '#333', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: '#555' }}>No agencies registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agencies.map(a => (
            <div key={a.id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
                  <Briefcase size={16} style={{ color: '#c084fc' }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{a.agencyName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#555' }}><Mail size={10} />{a.email}</span>
                    {a.website && <span className="flex items-center gap-1 text-xs" style={{ color: '#555' }}><Globe size={10} />{a.website}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs" style={{ color: '#333' }}>{new Date(a.createdAt).toLocaleDateString('en-ZA')}</p>
                <button onClick={() => handleDelete(a.id, a.agencyName)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: '#555' }}>
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
