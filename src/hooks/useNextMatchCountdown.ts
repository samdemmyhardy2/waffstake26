import { useEffect, useState } from 'react'
import {
  getMatchCountdownParts,
  getNextMatch,
  type MatchCountdownParts,
  type NextMatch,
} from '../utils/nextMatch'

interface NextMatchCountdownState {
  match: NextMatch | null
  countdown: MatchCountdownParts | null
}

function readCountdown(now: Date): NextMatchCountdownState {
  const match = getNextMatch(now)
  if (!match) return { match: null, countdown: null }

  return {
    match,
    countdown: getMatchCountdownParts(match.kickoff, now),
  }
}

export function useNextMatchCountdown(): NextMatchCountdownState {
  const [state, setState] = useState<NextMatchCountdownState>(() => readCountdown(new Date()))

  useEffect(() => {
    const tick = () => setState(readCountdown(new Date()))
    tick()
    const timer = window.setInterval(tick, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return state
}
