import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Loader from '../../components/Loader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
export default function AgencyAnalytics() {
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ api.getInfluencers().then(r=>setInfluencers(r.data)).finally(()=>setLoading(false)) },[])
  if(loading)return <Loader />
  const nicheData = Object.entries(influencers.reduce((a,i)=>{ const n=i.niche?.nicheName||'Unknown'; a[n]=(a[n]||0)+1; return a },{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)
  const engData = Object.entries(influencers.reduce((a,i)=>{ const n=i.niche?.nicheName||'Unknown'; if(!a[n])a[n]={t:0,c:0}; a[n].t+=i.engagementRate; a[n].c++; return a },{})).map(([name,v])=>({name,avg:parseFloat((v.t/v.c).toFixed(2))}))
  const botDist = [{name:'0-5% Clean',value:influencers.filter(i=>i.botScore<=0.05).length,color:'#4ade80'},{name:'5-15% OK',value:influencers.filter(i=>i.botScore>0.05&&i.botScore<=0.15).length,color:'#fbbf24'},{name:'15%+ Risk',value:influencers.filter(i=>i.botScore>0.15).length,color:'#f87171'}]
  const tip = { contentStyle:{background:'#111',border:'1px solid #2d2d2d',borderRadius:8} }
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Platform Analytics</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Aggregate insights across the influencer database</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5"><p className="label mb-3">Influencers by Niche</p><ResponsiveContainer width="100%" height={200}><BarChart data={nicheData}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/><XAxis dataKey="name" tick={{fill:'#555',fontSize:10}}/><YAxis tick={{fill:'#555',fontSize:10}}/><Tooltip {...tip} itemStyle={{color:'#c084fc'}}/><Bar dataKey="value" fill="#c084fc" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
        <div className="card p-5"><p className="label mb-3">Avg Engagement by Niche</p><ResponsiveContainer width="100%" height={200}><BarChart data={engData}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/><XAxis dataKey="name" tick={{fill:'#555',fontSize:10}}/><YAxis tick={{fill:'#555',fontSize:10}} unit="%"/><Tooltip {...tip} itemStyle={{color:'#2dd4bf'}}/><Bar dataKey="avg" fill="#2dd4bf" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
        <div className="card p-5">
          <p className="label mb-3">Authenticity Distribution</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={160}><PieChart><Pie data={botDist} dataKey="value" innerRadius={45} outerRadius={70}>{botDist.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer>
            <div className="space-y-2">{botDist.map(d=><div key={d.name} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:d.color}}/><span className="text-sm" style={{color:'#888'}}>{d.name}</span><span className="font-bold ml-auto text-sm" style={{color:d.color}}>{d.value}</span></div>)}</div>
          </div>
        </div>
        <div className="card p-5">
          <p className="label mb-3">Database Summary</p>
          <div className="space-y-2">
            {[['Total Influencers',influencers.length],['High Priority',influencers.filter(i=>i.refreshPriority==='High').length],['Verified',influencers.filter(i=>i.isVerified).length],['Avg Engagement',`${influencers.length?(influencers.reduce((a,i)=>a+parseFloat(i.engagementRate||0),0)/influencers.length).toFixed(2):0}%`],['Avg Bot Score',`${influencers.length?(influencers.reduce((a,i)=>a+parseFloat(i.botScore||0),0)/influencers.length*100).toFixed(1):0}%`]].map(([k,v])=>(
              <div key={k} className="flex justify-between text-sm"><span style={{color:'#555'}}>{k}</span><span className="font-semibold" style={{color:'#c084fc'}}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
