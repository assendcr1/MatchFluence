import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
export default function InfluencerMetrics() {
  const { session } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.getInfluencerMetrics(session.id).then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  if (loading) return <Loader />
  const history = data?.history || []
  const tip = { contentStyle:{background:'#111',border:'1px solid #2d2d2d',borderRadius:8}, labelStyle:{color:'#888'} }
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Metrics History</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Tracked automatically every 24-72 hours</p>
      {history.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-sm" style={{color:'#555'}}>No snapshots yet. Metrics are collected on each refresh cycle.</p></div>
      ) : (
        <div className="space-y-5">
          {[['Follower Count Over Time','followerCount','#2dd4bf',undefined],['Engagement Rate (%)','engagementRate','#4ade80','%'],['Bot Score Trend (lower is better)','botScore','#fbbf24','%']].map(([title,key,color,unit])=>(
            <div key={key} className="card p-5">
              <p className="label mb-4">{title}</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="snapshotDate" tickFormatter={v=>new Date(v).toLocaleDateString()} tick={{fill:'#444',fontSize:10}} />
                  <YAxis tick={{fill:'#444',fontSize:10}} unit={unit} />
                  <Tooltip {...tip} itemStyle={{color}} />
                  <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
