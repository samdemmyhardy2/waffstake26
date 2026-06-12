import { worldCupTeams } from '../data/worldCupTeams'
import { WORLD_CUP_MATCHES } from '../data/worldCupMatchTimes'

const TEAM_NAME_ALIASES: Record<string, string> = {
  Türkiye: 'Turkey',
}

const BELOW_TWENTY = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
] as const

const TENS = [
  '',
  '',
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
] as const

export interface NextMatch {
  matchNumber: number
  label: string
  kickoff: Date
  homeName: string
  awayName: string
  homeCrest: string | null
  awayCrest: string | null
}

export interface MatchCountdownParts {
  hoursWord: string
  minutesWord: string
}

export function spellCount(n: number): string {
  if (n < 0) return 'ZERO'
  if (n < 20) return BELOW_TWENTY[n] ?? String(n)

  const tens = Math.floor(n / 10)
  const ones = n % 10
  const tensWord = TENS[tens] ?? String(n)

  if (ones === 0) return tensWord
  return `${tensWord} ${BELOW_TWENTY[ones]}`
}

export function crestForTeamName(name: string): string | null {
  const lookup = TEAM_NAME_ALIASES[name] ?? name
  return worldCupTeams.find((team) => team.name === lookup)?.crest ?? null
}

export function getNextMatch(now = new Date()): NextMatch | null {
  const nowMs = now.getTime()

  for (const match of WORLD_CUP_MATCHES) {
    const kickoff = new Date(match.kickoffUtc)
    if (kickoff.getTime() <= nowMs) continue

    const [homeName, awayName] = match.label.split(' vs ')

    return {
      matchNumber: match.matchNumber,
      label: match.label,
      kickoff,
      homeName: homeName ?? '',
      awayName: awayName ?? '',
      homeCrest: crestForTeamName(homeName ?? ''),
      awayCrest: crestForTeamName(awayName ?? ''),
    }
  }

  return null
}

export function getMatchCountdownParts(target: Date, now = new Date()): MatchCountdownParts {
  const diffMs = Math.max(0, target.getTime() - now.getTime())
  const totalMinutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return {
    hoursWord: spellCount(hours),
    minutesWord: spellCount(minutes),
  }
}
