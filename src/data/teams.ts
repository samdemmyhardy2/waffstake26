import type { Team } from '../types'

/** Card data sourced from Transfermarkt match reports, 11 June 2026. */
export const DATA_AS_OF = '2026-06-12'

function p(
  id: string,
  name: string,
  position: string,
  club: string,
  yellowCards = 0,
  redCards = 0,
) {
  return { id, name, position, club, yellowCards, redCards }
}

export const teams: Team[] = [
  {
    id: 'mex',
    name: 'Mexico',
    shortName: 'MEX',
    group: 'A',
    flag: '🇲🇽',
    players: [
      p('mex-gutierrez', 'Brian Gutiérrez', 'MF', 'LA Galaxy', 1, 0),
      p('mex-montes', 'César Montes', 'DF', 'Monterrey', 0, 1),
    ],
  },
  {
    id: 'rsa',
    name: 'South Africa',
    shortName: 'RSA',
    group: 'A',
    flag: '🇿🇦',
    players: [
      p('rsa-mokoena', 'Teboho Mokoena', 'MF', 'Mamelodi Sundowns', 1, 0),
      p('rsa-sithole', 'Sphephelo Sithole', 'MF', 'Orlando Pirates', 0, 1),
      p('rsa-sibisi', 'Nkosinathi Sibisi', 'DF', 'Orlando Pirates', 1, 0),
      p('rsa-zwane', 'Themba Zwane', 'MF', 'Mamelodi Sundowns', 0, 1),
    ],
  },
  {
    id: 'kor',
    name: 'South Korea',
    shortName: 'KOR',
    group: 'A',
    flag: '🇰🇷',
    players: [
      p('kor-lee', 'Lee Gi-hyuk', 'MF', 'Gwangju FC', 1, 0),
    ],
  },
]

export const allTeamsSorted = [...teams].sort((a, b) => a.name.localeCompare(b.name))
