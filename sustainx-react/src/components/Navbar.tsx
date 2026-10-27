import type { Tab } from '../types'

const TABS: [Tab, string][] = [
  ['tracker', 'Tracker'], ['missions', 'Missions'], ['board', 'Leaderboard'],
  ['impact', 'Impact'], ['rewards', 'Rewards'], ['ai', 'AI Helper'],
]
interface Props { tab: Tab; onTab: (t: Tab) => void; onLogout: () => void }

export default function Navbar({ tab, onTab, onLogout }: Props) {
  return (
    <nav className="box" aria-label="Main">
      <span className="logo">🌱 sustainX</span>
      {TABS.map(([t, label]) => (
        <button key={t} data-v={t} className={tab === t ? 'on' : ''} onClick={() => onTab(t)}>{label}</button>
      ))}
      <span className="chip" role="button" tabIndex={0} onClick={onLogout}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onLogout()}>Log out</span>
    </nav>
  )
}
