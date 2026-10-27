import { PEOPLE } from '../data'
import type { LeaderboardEntry } from '../api'

const medal = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`

export default function Leaderboard({ xp, limit, entries, currentName = 'You' }: { xp: number; limit?: number; entries?: LeaderboardEntry[] | null; currentName?: string }) {
  const rows: [string, number][] = entries?.length
    ? entries.map(entry => [entry.name === currentName ? 'You' : entry.name, entry.xp])
    : [...PEOPLE, ['You', xp] as [string, number]].sort((a, b) => b[1] - a[1])
  const visibleRows = rows.slice(0, limit)
  return (
    <ul className="lb">
      {visibleRows.map(([name, pts], i) => (
        <li key={name} className={name === 'You' ? 'me' : ''}>
          <span>{medal(i)}</span><span>{name}</span><span>{pts} XP</span>
        </li>
      ))}
    </ul>
  )
}
