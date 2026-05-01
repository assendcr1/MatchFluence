export default function InfluencerConnect() {
  return (
    <div className="p-7 page-fade">
      <h1 className="text-xl font-bold text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Connect Accounts</h1>
      <p className="text-sm mb-7" style={{color:'#555'}}>Link your social accounts for richer data and better match accuracy</p>
      <div className="max-w-lg space-y-3">
        {[{p:'Instagram',c:'#2dd4bf',d:'Unlock audience demographics, real reach, and engagement insights',ok:true},{p:'TikTok',c:'#60a5fa',d:'Coming soon',ok:false},{p:'YouTube',c:'#c084fc',d:'Coming soon',ok:false}].map(({p,c,d,ok})=>(
          <div key={p} className="card p-5 flex items-center justify-between">
            <div><p className="font-semibold" style={{color:'#ccc'}}>{p}</p><p className="text-sm mt-0.5" style={{color:'#555'}}>{d}</p></div>
            {ok ? <button className="btn-primary text-sm" style={{background:c}}>Connect</button> : <span className="badge-amber">Soon</span>}
          </div>
        ))}
        <div className="card p-4" style={{borderColor:'rgba(45,212,191,0.15)'}}>
          <p className="text-xs leading-relaxed" style={{color:'#555'}}>Connecting your accounts gives MatchFluence read-only access to your public metrics. We never post on your behalf.</p>
        </div>
      </div>
    </div>
  )
}
