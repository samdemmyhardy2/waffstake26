export interface GamePlayer {
  id: string
  name: string
  defaultTeamSlug?: string
  isTestPlayer?: boolean
  excludedTeamSlugs?: string[]
}

export const TEST_PLAYER_ID = 'player-test'

export const GAME_PLAYERS: GamePlayer[] = [
  {
    id: TEST_PLAYER_ID,
    name: 'Player 1',
    isTestPlayer: true,
  },
  { id: 'tommy', name: 'Tommy', defaultTeamSlug: 'new-zealand' },
  { id: 'picot', name: 'Picot', defaultTeamSlug: 'uzbekistan' },
  { id: 'robs', name: 'Robs', defaultTeamSlug: 'uruguay' },
  { id: 'dmoz', name: 'Dmoz', defaultTeamSlug: 'mexico' },
  { id: 'felix', name: 'Felix', defaultTeamSlug: 'france' },
  { id: 'jp', name: 'JP', defaultTeamSlug: 'spain' },
  { id: 'matt', name: 'Matt', defaultTeamSlug: 'england' },
]

export function getGamePlayer(playerId: string): GamePlayer | undefined {
  return GAME_PLAYERS.find((player) => player.id === playerId)
}

export function getVisibleGamePlayers(): GamePlayer[] {
  return GAME_PLAYERS.filter((player) => !player.isTestPlayer)
}

export function isTeamExcludedForPlayer(playerId: string, teamSlug: string): boolean {
  const player = getGamePlayer(playerId)
  return player?.excludedTeamSlugs?.includes(teamSlug) ?? false
}
