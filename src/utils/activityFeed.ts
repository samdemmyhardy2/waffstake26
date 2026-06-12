import { getGamePlayer } from '../data/gamePlayers'
import { scheduleSyncPush } from './gameSync'
import { teamNameFromSlug } from './teamName'

export const ACTIVITY_KEY = 'waffstake-activity-feed'

const MAX_ENTRIES = 30

export type ActivityType = 'picked' | 'added' | 'swapped' | 'stole'

export interface ActivityEntry {
  id: string
  at: string
  playerId: string
  type: ActivityType
  teamSlug: string
  cost?: number
  fromPlayerId?: string | null
}

function readActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as ActivityEntry[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (entry): entry is ActivityEntry =>
        typeof entry?.id === 'string' &&
        typeof entry?.at === 'string' &&
        typeof entry?.playerId === 'string' &&
        typeof entry?.teamSlug === 'string' &&
        (entry.type === 'picked' ||
          entry.type === 'added' ||
          entry.type === 'swapped' ||
          entry.type === 'stole'),
    )
  } catch {
    return []
  }
}

function writeActivity(entries: ActivityEntry[]): void {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries))
  window.dispatchEvent(new CustomEvent('waffstake-activity-change'))
  scheduleSyncPush()
}

export function getActivityFeed(): ActivityEntry[] {
  return readActivity()
}

export function clearActivityFeed(): void {
  writeActivity([])
}

export function appendActivity(
  entry: Omit<ActivityEntry, 'id' | 'at'>,
): void {
  const next: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  }

  writeActivity([next, ...readActivity()].slice(0, MAX_ENTRIES))
}

export function formatActivityEntry(entry: ActivityEntry): string {
  const player = getGamePlayer(entry.playerId)?.name ?? 'Someone'
  const team = teamNameFromSlug(entry.teamSlug)
  const from = entry.fromPlayerId ? getGamePlayer(entry.fromPlayerId)?.name : null

  switch (entry.type) {
    case 'picked':
      return `${player} picked ${team}`
    case 'added':
      return `${player} added ${team} for ${entry.cost ?? 0} cards`
    case 'swapped':
      return `${player} bought ${team} for ${entry.cost ?? 0} cards`
    case 'stole':
      return `${player} stole ${team} from ${from ?? 'someone'} for ${entry.cost ?? 0} cards`
  }
}

export function subscribeActivityFeed(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === ACTIVITY_KEY) listener()
  }
  const onCustom = () => listener()

  window.addEventListener('storage', onStorage)
  window.addEventListener('waffstake-activity-change', onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('waffstake-activity-change', onCustom)
  }
}
