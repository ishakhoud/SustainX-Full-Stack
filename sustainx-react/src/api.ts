const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')
const TOKEN_KEY = 'sustainx:token'
let authToken = (() => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } })()

export function setAuthToken(token: string | null) {
  authToken = token
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY) } catch { /* storage may be unavailable */ }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `API request failed (${response.status})`)
  return body as T
}

export interface ApiUser { id: string; name: string; xp: number; co2: number; activities: number }
export interface ApiActivity { id: number; text: string; xp: number; co2: number; createdAt: string }
export type ApiProfile = Omit<ApiUser, 'activities'> & { activityCount: number; activities: ApiActivity[] }
export interface LeaderboardEntry { id: string; name: string; xp: number }
export interface AuthResponse { token: string; user: ApiUser }
export interface EcoBotSource { text: string; source: string; chunk: number; score: number }
export interface EcoBotResponse { answer: string; sources: EcoBotSource[] }

export const api = {
  register: (username: string, password: string) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request<ApiProfile>('/api/auth/me'),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  logActivity: (text: string, xp: number, co2: number) =>
    request<ApiActivity>('/api/activities', { method: 'POST', body: JSON.stringify({ text, xp, co2 }) }),
  getLeaderboard: () => request<LeaderboardEntry[]>('/api/leaderboard'),
  chat: (message: string) => request<EcoBotResponse>('/api/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}
