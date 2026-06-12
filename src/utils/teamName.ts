import { worldCupTeams } from '../data/worldCupTeams'

const NAME_BY_SLUG = new Map(worldCupTeams.map((team) => [team.slug, team.name]))

export function teamNameFromSlug(slug: string | null): string {
  if (!slug) return 'No team yet'
  return NAME_BY_SLUG.get(slug) ?? slug
}
