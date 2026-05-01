import { useAuth } from '../../context/AuthContext'
export default function BrandSettings() {
  const { session } = useAuth()
  return (
    <div className="p-7 page-fade max-w-lg">
      <h1 className="text-xl font-bold text-white mb-7" style={{fontFamily:'Syne,sans-serif'}}>Settings</h1>
      <div className="card p-6 space-y-4">
        <div><label className="label">Company</label><p style={{color:'#ccc'}}>{session.name}</p></div>
        <div><label className="label">User Type</label><span className="badge-blue">Brand</span></div>
        <div><label className="label">API Key</label><p className="font-mono text-xs" style={{color:'#444'}}>••••••••••••••••••••••••••••••••</p></div>
      </div>
    </div>
  )
}
