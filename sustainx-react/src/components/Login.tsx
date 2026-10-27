import { useState, type FormEvent } from 'react'
import { api, setAuthToken } from '../api'

export default function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const result = isRegister
        ? await api.register(username.trim(), password)
        : await api.login(username.trim(), password)
      setAuthToken(result.token)
      onLogin(result.user.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in. Check that the backend is running.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="loginwrap">
      <form className="box lcard" onSubmit={submit}>
        <h1>🌱 sustainX</h1>
        <p>Sign in to save your eco actions and join the leaderboard.</p>
        <div className="auth-modes">
          <button type="button" className={isRegister ? 'selected' : ''} onClick={() => { setIsRegister(true); setError('') }}>Create account</button>
          <button type="button" className={!isRegister ? 'selected' : ''} onClick={() => { setIsRegister(false); setError('') }}>Sign in</button>
        </div>
        <label htmlFor="username">Username</label>
        <input id="username" value={username} minLength={3} maxLength={20} autoComplete="username" required placeholder="3–20 letters, numbers or _"
          onChange={e => setUsername(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} minLength={isRegister ? 10 : 1} autoComplete={isRegister ? 'new-password' : 'current-password'} required
          placeholder={isRegister ? '10+ chars, upper/lower case and a number' : 'Your password'} onChange={e => setPassword(e.target.value)} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" style={{ background: 'var(--mint)' }} disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
       
      </form>
    </div>
  )
}
