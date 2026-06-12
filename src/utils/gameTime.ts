import { WORLD_CUP_MATCHES } from '../data/worldCupMatchTimes'

/** Minutes after kickoff treated as live play (incl. stoppage / extra time buffer). */
const MATCH_LIVE_MINUTES = 130

const MATCH_LIVE_MS = MATCH_LIVE_MINUTES * 60 * 1000

export interface LiveMatchWindow {
  matchNumber: number
  label: string
  kickoff: Date
  ends: Date
}

export function getLiveMatchWindow(now = new Date()): LiveMatchWindow | null {
  const nowMs = now.getTime()

  for (const match of WORLD_CUP_MATCHES) {
    const kickoff = new Date(match.kickoffUtc)
    const startMs = kickoff.getTime()
    const endMs = startMs + MATCH_LIVE_MS

    if (nowMs >= startMs && nowMs < endMs) {
      return {
        matchNumber: match.matchNumber,
        label: match.label,
        kickoff,
        ends: new Date(endMs),
      }
    }
  }

  return null
}

export function isGameTime(now = new Date()): boolean {
  return getLiveMatchWindow(now) !== null
}

export function gameTimeMessage(now = new Date()): string {
  const live = getLiveMatchWindow(now)
  if (!live) return 'No swapping during game time — a match is live right now.'

  return `No swapping during game time — ${live.label} is live.`
}
