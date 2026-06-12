export interface Player {
  id: string
  name: string
  position: string
  club: string
  yellowCards: number
  redCards: number
}

export interface Team {
  id: string
  name: string
  shortName: string
  group: string
  flag: string
  players: Player[]
}

export const CARD_VALUES = {
  yellow: 10,
  red: 25,
} as const
