import { teams } from '../data/teams'
import { worldCupTeams, type WorldCupTeam } from '../data/worldCupTeams'
import { teamCardCounts } from './bank'

const TRACKER_NAME_BY_ID: Record<string, string> = {
  mex: 'Mexico',
  rsa: 'South Africa',
  kor: 'South Korea',
}

export interface LeaderboardRow extends WorldCupTeam {
  yellowCards: number
  redCards: number
  totalCards: number
}

export function buildLeaderboardRows(): LeaderboardRow[] {
  const countsByName = new Map<string, { yellow: number; red: number }>()

  for (const team of teams) {
    const label = TRACKER_NAME_BY_ID[team.id] ?? team.name
    countsByName.set(label, teamCardCounts(team))
  }

  return worldCupTeams
    .map((team) => {
      const counts = countsByName.get(team.name) ?? { yellow: 0, red: 0 }
      return {
        ...team,
        yellowCards: counts.yellow,
        redCards: counts.red,
        totalCards: counts.yellow + counts.red,
      }
    })
    .sort((a, b) => {
      if (b.totalCards !== a.totalCards) return b.totalCards - a.totalCards
      if (b.yellowCards !== a.yellowCards) return b.yellowCards - a.yellowCards
      return a.name.localeCompare(b.name)
    })
}
