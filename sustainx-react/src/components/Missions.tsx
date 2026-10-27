import { MISSIONS } from '../data'
import type { Mission } from '../types'

interface Props { done: boolean[]; onDone: (i: number) => void; onShare: (m: Mission) => void }

export default function Missions({ done, onDone, onShare }: Props) {
  return (
    <>
      <h2>Weekly missions</h2>
      <p>Finish challenges for big XP boosts.</p>
      <div className="missions">
        {MISSIONS.map((m, i) => (
          <div key={m.title} className={`box m${done[i] ? ' done' : ''}`} role="button" tabIndex={0} aria-pressed={done[i]}
            onClick={() => onDone(i)}
            onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onDone(i) } }}>
            <div className="row"><span className="tag">{m.tag}</span><b>+{m.xp} XP</b></div>
            <h3 style={{ marginTop: 8 }}>{m.title}</h3>
            <p>{m.desc}</p>
            {done[i] && <button className="chip sharebtn" onClick={e => { e.stopPropagation(); onShare(m) }}>↗ Share achievement</button>}
          </div>
        ))}
      </div>
    </>
  )
}
