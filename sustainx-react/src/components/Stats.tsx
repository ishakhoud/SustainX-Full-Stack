import { levelOf } from '../data'

export default function Stats({ xp, streak }: { xp: number; streak: number }) {
  const lv = levelOf(xp), into = xp % 850
  return (
    <div className="top">
      <div className="box streak">
        <div>Current streak</div><b>{streak}</b> 🔥<div>days in a row</div>
        <div className="dots">{Array.from({ length: 7 }, (_, i) => <i key={i} className={i < streak ? 'on' : ''} />)}</div>
      </div>
      <div className="box lvl">
        <div className="row"><h3>Level {lv} Eco-Warrior</h3><b>{xp} XP</b></div>
        <div className="bar"><i style={{ width: `${Math.round((into / 850) * 100)}%` }} /></div>
        <small>{850 - into} XP to Level {lv + 1}</small>
      </div>
    </div>
  )
}
