import { ACTIONS } from '../data'
import type { Save } from '../types'
import Leaderboard from './Leaderboard'
import type { LeaderboardEntry } from '../api'

interface Props { s: Save; onLog: (text: string, xp: number, co2: number) => void; onCustom: () => void; leaderboard?: LeaderboardEntry[] | null; userName?: string }

export default function Tracker({ s, onLog, onCustom, leaderboard, userName }: Props) {
  const all = [...ACTIONS, ...s.custom]
  return (
    <div className="cols">
      <div>
        <div className="row">
          <h2>Log an action</h2>
          <button className="chip box" style={{ padding: '4px 12px', boxShadow: '3px 3px 0 var(--ink)', background: 'var(--mint)' }} onClick={onCustom}>+ Custom</button>
        </div>
        <div className="grid">
          {all.map((a, i) => (
            <button key={i} className="act" style={{ background: a.color }} onClick={() => onLog(`${a.emoji} ${a.name}`, a.xp, a.co2)}>
              <span>{a.emoji}</span><b>{a.name}</b><small>+{a.xp} XP</small>
            </button>
          ))}
        </div>
        <h2>Recent history</h2>
        <div className="box hist">
          {s.hist.length
            ? s.hist.map(h => <div key={h.id}><span>{h.text}</span><em>+{h.xp} XP</em></div>)
            : <div className="empty"><span>Nothing logged yet. Tap an action to start.</span></div>}
        </div>
      </div>
      <aside>
        <div className="box side">
          <h3>🏆 Your badges</h3>
          <div className="badges">
            {s.badges.map(b => <span key={b} className="badge">{b}</span>)}
            <span className="badge lock">+3 locked</span>
          </div>
        </div>
        <div className="box side"><h3>Top planet savers</h3><Leaderboard xp={s.xp} limit={4} entries={leaderboard} currentName={userName} /></div>
      </aside>
    </div>
  )
}
