import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function InfluencerSettings() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [inf, setInf] = useState(null)
  const [niches, setNiches] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    Promise.all([
      api.getInfluencerById(session.id),
      api.getNiches(),
      api.getMarkets()
    ]).then(([i, n, m]) => {
      setInf(i.data); setNiches(n.data); setMarkets(m.data)
    }).finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setInf(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateInfluencer(session.id, inf)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { }
    finally { setSaving(false) }
  }

  const handleDeleteData = async () => {
    if (deleteInput !== session.displayName) return
    setDeleting(true)
    try {
      await api.deleteInfluencer(session.id)
      logout()
      navigate('/')
    } catch {
      alert('Deletion failed. Please contact privacy@ablant.co to request manual deletion.')
    } finally { setDeleting(false) }
  }

  if (loading) return <Loader />

  return (
    <div className="p-7 page-fade max-w-lg">
      <h1 className="text-xl font-bold text-white mb-7" style={{ fontFamily: 'Syne, sans-serif' }}>
        Profile Settings
      </h1>

      {/* Profile form */}
      <div className="card p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Name</label>
            <input className="input" value={inf?.name || ''} onChange={e => set('name', e.target.value)} />
          </div>
          <div><label className="label">Display Name</label>
            <input className="input" value={inf?.displayName || ''} onChange={e => set('displayName', e.target.value)} />
          </div>
        </div>
        <div><label className="label">Email</label>
          <input className="input" type="email" value={inf?.email || ''} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Niche</label>
            <select className="input" value={inf?.nicheId || ''} onChange={e => set('nicheId', parseInt(e.target.value))}>
              {niches.map(n => <option key={n.id} value={n.id}>{n.nicheName}</option>)}
            </select>
          </div>
          <div><label className="label">Market</label>
            <select className="input" value={inf?.marketId || ''} onChange={e => set('marketId', parseInt(e.target.value))}>
              {markets.map(m => <option key={m.id} value={m.id}>{m.marketName}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">Instagram Handle</label>
          <input className="input" placeholder="@handle" value={inf?.instagramHandle || ''} onChange={e => set('instagramHandle', e.target.value)} />
        </div>
        <div><label className="label">TikTok Handle</label>
          <input className="input" placeholder="@handle" value={inf?.tikTokHandle || ''} onChange={e => set('tikTokHandle', e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ background: '#2dd4bf' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Data & Privacy */}
      <div className="card p-6 mb-6">
        <p className="font-semibold mb-1" style={{ color: '#ccc', fontFamily: 'Syne, sans-serif' }}>
          Data & Privacy
        </p>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: '#555' }}>
          Under POPIA you have the right to access and delete your personal data held by MatFluenca.
        </p>
        <div className="space-y-3">
          <a
            href="/privacy"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-lg text-sm"
            style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#888', textDecoration: 'none' }}
          >
            <span>Privacy Policy</span>
            <span style={{ color: '#444' }}>→</span>
          </a>
          <a
            href="/terms"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-lg text-sm"
            style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#888', textDecoration: 'none' }}
          >
            <span>Terms of Service</span>
            <span style={{ color: '#444' }}>→</span>
          </a>
          <a
            href="mailto:privacy@ablant.co?subject=Data Deletion Request&body=Please delete all personal data associated with my MatFluenca account. My display name is: "
            className="flex items-center justify-between p-3 rounded-lg text-sm"
            style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#888', textDecoration: 'none' }}
          >
            <span>Request Data Export</span>
            <span style={{ color: '#444' }}>→</span>
          </a>
        </div>
      </div>

      {/* Delete account */}
      <div className="card p-6" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={15} style={{ color: '#f87171' }} />
          <p className="font-semibold" style={{ color: '#f87171', fontFamily: 'Syne, sans-serif' }}>
            Delete My Data
          </p>
        </div>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: '#555' }}>
          This permanently deletes your profile, all metric history, and campaign match records
          from MatFluenca. This action cannot be undone and complies with your POPIA right to erasure.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <Trash2 size={13} />
            Delete My Data
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(248,113,113,0.06)', color: '#f87171', border: '1px solid rgba(248,113,113,0.15)' }}>
              ⚠ This will permanently delete your account and all associated data.
            </div>
            <div>
              <label className="label">
                Type your display name <span style={{ color: '#f87171' }}>{session.displayName}</span> to confirm
              </label>
              <input
                className="input"
                placeholder={session.displayName}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteData}
                disabled={deleteInput !== session.displayName || deleting}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
                style={{
                  background: deleteInput === session.displayName ? '#ef4444' : 'rgba(248,113,113,0.1)',
                  color: deleteInput === session.displayName ? 'white' : '#f87171',
                  border: '1px solid rgba(248,113,113,0.3)',
                  cursor: deleteInput === session.displayName ? 'pointer' : 'not-allowed',
                  opacity: deleting ? 0.6 : 1
                }}
              >
                <Trash2 size={13} />
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
