import { REWARDS } from '../data'

export default function Rewards({ coins, onRedeem }: { coins: number; onRedeem: (i: number) => void }) {
  return (
    <>
      <div className="row"><h2>Rewards</h2><b>🍃 {coins} coins</b></div>
      <p>Earn 1 leaf coin for every 10 XP and spend them at partner shops.</p>
      <div className="rw">
        {REWARDS.map((r, i) => (
          <div key={r.title} className="box side">
            <div className="row"><span style={{ fontSize: '2rem' }}>{r.emoji}</span><span className="tag sp">Partner</span></div>
            <h3>{r.title}</h3>
            <p style={{ margin: '4px 0 10px' }}>{r.shop}</p>
            <button className="chip box" style={{ background: coins >= r.cost ? 'var(--mint)' : 'var(--card)', boxShadow: '3px 3px 0 var(--ink)' }}
              onClick={() => onRedeem(i)}>{r.cost} coins · Redeem</button>
          </div>
        ))}
      </div>
    </>
  )
}
