export default function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={28} style={{ color: '#333', marginBottom: 12 }} />}
      <p className="font-semibold mb-1" style={{ color: '#ccc' }}>{title}</p>
      <p className="text-sm mb-5" style={{ color: '#555' }}>{sub}</p>
      {action}
    </div>
  )
}
