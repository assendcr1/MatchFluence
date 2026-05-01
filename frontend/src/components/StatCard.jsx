export default function StatCard({ label, value, sub, accent = '#2dd4bf', icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <p className="label">{label}</p>
        {Icon && <Icon size={15} style={{ color: accent, opacity: 0.6 }} />}
      </div>
      <p className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: accent }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#555' }}>{sub}</p>}
    </div>
  )
}
