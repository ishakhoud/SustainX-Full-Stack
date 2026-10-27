import { useState } from 'react'
import type { Action } from '../types'

const overlay = { zIndex: 30, background: 'rgba(38,51,46,.55)' }

export function ShareModal({ text, onClose, onCopied }: { text: string; onClose: () => void; onCopied: () => void }) {
  const copy = () => { navigator.clipboard?.writeText(text).then(onCopied).catch(() => {}) }
  return (
    <div className="loginwrap" style={overlay}>
      <div className="box lcard">
        <h3>Share your win 🌱</h3>
        <textarea readOnly value={text} aria-label="Share text" />
        <button style={{ background: 'var(--mint)' }} onClick={copy}>Copy text</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--butter)' }}>Share on WhatsApp</a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--sky)' }}>Share on X</a>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

const COLORS = ['var(--mint)', 'var(--pink)', 'var(--sky)', 'var(--butter)', 'var(--lilac)']

export function CustomModal({ count, onAdd, onClose }: { count: number; onAdd: (a: Action) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [xp, setXp] = useState(40)
  const add = () => { if (name.trim()) onAdd({ emoji: emoji.trim() || '✨', name: name.trim(), xp, co2: 0.3, color: COLORS[count % 5] }) }
  return (
    <div className="loginwrap" style={overlay}>
      <div className="box lcard">
        <h3>Add your own action</h3>
        <input value={name} maxLength={40} placeholder="e.g. Composted kitchen scraps" aria-label="Action name" onChange={e => setName(e.target.value)} />
        <input value={emoji} maxLength={4} placeholder="Emoji (optional)" aria-label="Emoji" onChange={e => setEmoji(e.target.value)} />
        <select value={xp} aria-label="XP" onChange={e => setXp(Number(e.target.value))}>
          {[20, 40, 60, 80, 100].map(v => <option key={v} value={v}>{v} XP</option>)}
        </select>
        <button style={{ background: 'var(--mint)' }} onClick={add}>Add to my actions</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
