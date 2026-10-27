import type { Action, Mission, Reward, Save } from './types'

export const ACTIONS: Action[] = [
  { emoji: '♻️', name: 'Recycled', xp: 50, co2: 0.5, color: 'var(--mint)' },
  { emoji: '🥗', name: 'Veggie meal', xp: 75, co2: 1.5, color: 'var(--mint)' },
  { emoji: '🚌', name: 'Public transport', xp: 100, co2: 2.1, color: 'var(--sky)' },
  { emoji: '👚', name: 'Thrifting', xp: 80, co2: 3, color: 'var(--pink)' },
  { emoji: '🧺', name: 'Cold wash', xp: 60, co2: 0.6, color: 'var(--sky)' },
  { emoji: '🧴', name: 'Refill bottle', xp: 30, co2: 0.1, color: 'var(--butter)' },
]
export const MISSIONS: Mission[] = [
  { tag: 'Weekly', xp: 500, title: 'Plastic-free week', desc: 'Avoid single-use plastics for 7 days.' },
  { tag: 'Daily', xp: 200, title: 'Zero waste day', desc: 'Produce no landfill trash today.' },
  { tag: 'Daily', xp: 100, title: 'Save 10 litres', desc: 'Take a shorter shower or fix a leak.' },
  { tag: 'Weekly', xp: 1000, title: 'Plant a tree', desc: 'Plant a local species or donate to a planting org.' },
]
export const REWARDS: Reward[] = [
  { emoji: '☕', title: 'Free coffee refill', shop: 'GreenSip Café', cost: 100 },
  { emoji: '👚', title: '10% off a thrift haul', shop: 'ReWear Store', cost: 150 },
  { emoji: '🌱', title: 'Free plant sapling', shop: 'City Nursery', cost: 200 },
  { emoji: '🚲', title: 'Day pass for bike rental', shop: 'PedalPal', cost: 250 },
]
export const PEOPLE: [string, number][] = [
  ['EcoQueen99', 5400], ['GreenNinja', 4800], ['PlanetSaver', 4400], ['LeafLover', 3900], ['RiverRanger', 3500],
]
export const FRESH: Save = {
  xp: 0, co2: 0, acts: 0, streak: 1, coins: 0, badges: ['Eco starter'], custom: [],
  done: [false, false, false, false], hist: [],
}
export const DEMO: Save = {
  xp: 4250, co2: 0, acts: 0, streak: 12, coins: 120, badges: ['Eco starter', 'Plastic free', 'Bike rider'],
  custom: [], done: [true, true, false, false], hist: [{ id: 1, text: '♻️ Recycled glass', xp: 50 }],
}
export const levelOf = (xp: number) => Math.floor(xp / 850) + 1
export const stageOf = (lv: number) => (lv < 3 ? 'Seedling' : lv < 5 ? 'Sapling' : lv < 8 ? 'Young tree' : 'Mighty tree')
