import { CARD_VALUES, type Player, type Team } from '../types'

export function playerCardTotal(player: Player): number {
  return player.yellowCards * CARD_VALUES.yellow + player.redCards * CARD_VALUES.red
}

export function teamBank(team: Team): number {
  return team.players.reduce((sum, player) => sum + playerCardTotal(player), 0)
}

export function teamCardCounts(team: Team) {
  return team.players.reduce(
    (acc, player) => ({
      yellow: acc.yellow + player.yellowCards,
      red: acc.red + player.redCards,
    }),
    { yellow: 0, red: 0 },
  )
}

export function formatBank(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`
}
