export default function BotBadge({ score }) {
  const pct = Math.round((typeof score === 'number' ? score : 0) * 100)
  if (pct <= 5) return <span className="badge-green">✓ {pct}% bots</span>
  if (pct <= 15) return <span className="badge-amber">⚠ {pct}% bots</span>
  return <span className="badge-red">⚡ {pct}% bots</span>
}
