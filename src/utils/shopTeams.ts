import { worldCupTeams } from '../data/worldCupTeams'
import { TEAM_SEED_BY_SLUG, cardsRequiredForSeed } from '../data/teamSeeds'

export interface ShopTeam {
  name: string
  slug: string
  crest: string
  seed: number
  cardsRequired: number
}

export function buildShopTeams(): ShopTeam[] {
  return worldCupTeams
    .map((team) => {
      const seed = TEAM_SEED_BY_SLUG[team.slug] ?? 48
      return {
        name: team.name,
        slug: team.slug,
        crest: team.crest,
        seed,
        cardsRequired: cardsRequiredForSeed(seed),
      }
    })
    .sort((a, b) => a.seed - b.seed || a.name.localeCompare(b.name))
}
