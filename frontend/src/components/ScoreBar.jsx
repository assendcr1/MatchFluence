export default function ScoreBar({ score, max = 100, color = '#2dd4bf' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: '#555' }}>
        <span>Match score</span><span style={{ color }} className="font-bold">{score}/{max}</span>
      </div>
      <div className="score-bar"><div className="score-fill" style={{ width: `${(score/max)*100}%`, background: color }} /></div>
    </div>
  )
}
