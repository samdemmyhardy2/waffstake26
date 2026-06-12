import type { Player, Team } from '../types'
import { playerCardTotal } from '../utils/bank'

interface PlayerCardProps {
  player: Player
  team: Team
  isSelectedTeam: boolean
  onClick: () => void
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function PlayerCard({ player, team, isSelectedTeam, onClick }: PlayerCardProps) {
  const hasCards = player.yellowCards > 0 || player.redCards > 0
  const total = playerCardTotal(player)

  return (
    <button
      type="button"
      className={`player-card${isSelectedTeam ? ' player-card--mine' : ''}${hasCards ? ' player-card--has-cards' : ''}`}
      onClick={onClick}
      aria-label={`${player.name}, ${player.position}, ${team.name}. ${player.yellowCards} yellow cards, ${player.redCards} red cards.`}
    >
      <div className="player-card__avatar" aria-hidden="true">
        <span className="player-card__initials">{initials(player.name)}</span>
        {hasCards && (
          <div className="player-card__badges">
            {player.yellowCards > 0 && (
              <span className="player-card__badge player-card__badge--yellow" title="Yellow cards">
                {player.yellowCards}
              </span>
            )}
            {player.redCards > 0 && (
              <span className="player-card__badge player-card__badge--red" title="Red cards">
                {player.redCards}
              </span>
            )}
          </div>
        )}
      </div>
      <span className="player-card__name">{player.name}</span>
      <span className="player-card__meta">
        {team.shortName} · {player.position}
      </span>
      {hasCards && <span className="player-card__bank">£{total}</span>}
    </button>
  )
}
