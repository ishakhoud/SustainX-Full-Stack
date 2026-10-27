import { useEffect, useState } from 'react'
import type { Action, Mission, Save, Tab } from './types'
import { DEMO, FRESH, MISSIONS, REWARDS } from './data'
import Login from './components/Login'
import Navbar from './components/Navbar'
import TreeScene from './components/TreeScene'
import Stats from './components/Stats'
import Tracker from './components/Tracker'
import Leaderboard from './components/Leaderboard'
import Missions from './components/Missions'
import Impact from './components/Impact'
import Rewards from './components/Rewards'
import { CustomModal, ShareModal } from './components/Modals'
import EcoBot from './components/EcoBot'
import { api, setAuthToken, type LeaderboardEntry } from './api'

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } }
const loadSave = (user: string): Save => {
  const raw = read('sustainx:' + user)
  return raw ? (JSON.parse(raw) as Save) : user === 'demo' ? DEMO : FRESH
}

function Dashboard({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [s, setS] = useState<Save>(() => loadSave(user))
  const [tab, setTab] = useState<Tab>('tracker')
  const [toast, setToast] = useState('')
  const [burst, setBurst] = useState(0)
  const [shareText, setShareText] = useState<string | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null)

  useEffect(() => write('sustainx:' + user, JSON.stringify(s)), [s, user])
  useEffect(() => {
    let active = true
    api.me()
      .then(async profile => {
        if (!active) return
        const board = await api.getLeaderboard()
        if (!active) return
        setS(previous => ({
          ...previous,
          xp: profile.xp,
          co2: profile.co2,
          acts: profile.activityCount,
          hist: profile.activities.map(item => ({ id: item.id, text: item.text, xp: item.xp })),
        }))
        setLeaderboard(board)
      })
      .catch(() => { if (active) setLeaderboard(null) })
    return () => { active = false }
  }, [user])
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(''), 1800) }

  const log = (text: string, xp: number, co2: number) => {
    setS(p => {
      const acts = p.acts + 1
      const badges = acts === 3 && !p.badges.includes('Hat-trick') ? [...p.badges, 'Hat-trick'] : p.badges
      return { ...p, xp: p.xp + xp, co2: p.co2 + co2, acts, badges, coins: p.coins + Math.round(xp / 10), hist: [{ id: Date.now(), text, xp }, ...p.hist] }
    })
    setBurst(b => b + 1)
    say(`+${xp} XP – nice one!`)
    const saveToBackend = () => api.logActivity(text, xp, co2)
      .then(() => api.getLeaderboard())
      .then(setLeaderboard)
      .catch(() => say('Saved in this browser; backend was unavailable'))
    void saveToBackend()
  }
  const finishMission = (i: number) => {
    if (s.done[i]) return
    setS(p => ({ ...p, done: p.done.map((d, j) => d || j === i) }))
    log(`🎯 ${MISSIONS[i].title}`, MISSIONS[i].xp, 2)
  }
  const share = (m: Mission) => {
    const text = `I just completed "${m.title}" on sustainX and earned ${m.xp} XP! 🌱 #sustainX`
    if (navigator.share) navigator.share({ text }).catch(e => { if (e?.name !== 'AbortError') setShareText(text) })
    else setShareText(text)
  }
  const redeem = (i: number) => {
    const r = REWARDS[i]
    if (s.coins < r.cost) return say(`Earn ${r.cost - s.coins} more coins first`)
    setS(p => ({ ...p, coins: p.coins - r.cost }))
    say(`Redeemed! Code SX-${Math.floor(1000 + Math.random() * 9000)}`)
  }
  const addCustom = (a: Action) => { setS(p => ({ ...p, custom: [...p.custom, a] })); setCustomOpen(false); say('Custom action added!') }

  return (
    <div className="wrap">
      <Navbar tab={tab} onTab={setTab} onLogout={onLogout} />
      <TreeScene xp={s.xp} burst={burst} />
      <Stats xp={s.xp} streak={s.streak} />
      <section className="view on">
        {tab === 'tracker' && <Tracker s={s} onLog={log} onCustom={() => setCustomOpen(true)} leaderboard={leaderboard} userName={user} />}
        {tab === 'missions' && <Missions done={s.done} onDone={finishMission} onShare={share} />}
        {tab === 'board' && <><h2>Global leaderboard</h2><div className="box side"><Leaderboard xp={s.xp} entries={leaderboard} currentName={user} /></div></>}
        {tab === 'impact' && <Impact co2={s.co2} acts={s.acts} />}
        {tab === 'rewards' && <Rewards coins={s.coins} onRedeem={redeem} />}
        {tab === 'ai' && <EcoBot />}
      </section>
      {customOpen && <CustomModal count={s.custom.length} onAdd={addCustom} onClose={() => setCustomOpen(false)} />}
      {shareText && <ShareModal text={shareText} onClose={() => setShareText(null)} onCopied={() => say('Copied!')} />}
      <div className={`toast${toast ? ' show' : ''}`} role="status">{toast}</div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<string | null>(() => read('sustainx:token') ? read('user') : null)
  const [authLoading, setAuthLoading] = useState(() => Boolean(read('sustainx:token')))

  useEffect(() => {
    if (!read('sustainx:token')) return
    api.me()
      .then(profile => { write('user', profile.name); setUser(profile.name) })
      .catch(() => { setAuthToken(null); try { localStorage.removeItem('user') } catch { /* ignore */ }; setUser(null) })
      .finally(() => setAuthLoading(false))
  }, [])

  const login = (name: string) => { write('user', name); setUser(name) }
  const logout = () => {
    void api.logout().catch(() => undefined).finally(() => {
      setAuthToken(null)
      try { localStorage.removeItem('user') } catch { /* ignore */ }
      setUser(null)
    })
  }
  if (authLoading) return <div className="loginwrap"><p>Checking your sign-in…</p></div>
  return user ? <Dashboard key={user} user={user} onLogout={logout} /> : <Login onLogin={login} />
}
