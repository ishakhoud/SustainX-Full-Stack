export interface Action { emoji: string; name: string; xp: number; co2: number; color: string }
export interface Mission { tag: string; xp: number; title: string; desc: string }
export interface Reward { emoji: string; title: string; shop: string; cost: number }
export interface HistItem { id: number; text: string; xp: number }
export interface Save {
  xp: number; co2: number; acts: number; streak: number; coins: number
  badges: string[]; custom: Action[]; done: boolean[]; hist: HistItem[]
}
export type Tab = 'tracker' | 'missions' | 'board' | 'impact' | 'rewards' | 'ai'
