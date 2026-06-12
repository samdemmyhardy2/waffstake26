import { useState } from 'react'
import type { Player, Team } from '../types'
import { formatBank, teamBank, teamCardCounts } from '../utils/bank'
import { PlayerCard } from './PlayerCard'
import { PlayerModal } from './PlayerModal'

interface TeamSectionProps {
  team: Team
  selectedTeamId: string | null
  searchQuery: string
}

export function TeamSection({ team, selectedTeamId, searchQuery }: TeamSectionProps) {
  const [activePlayer, setActivePlayer] = useState<{ player: Player; team: Team } | null>(null)

  const query = searchQuery.trim().toLowerCase()
  const filteredPlayers = query
    ? team.players.filter(
        (player) =>
          player.name.toLowerCase().includes(query) ||
          player.position.toLowerCase().includes(query) ||
          player.club.toLowerCase().includes(query),
      )
    : team.players

  if (filteredPlayers.length === 0) return null

  const counts = teamCardCounts(team)
  const bank = teamBank(team)
  const isMine = team.id === selectedTeamId

  return (
    <section className={`team-section${isMine ? ' team-section--mine' : ''}`} id={`team-${team.id}`}>
      <header className="team-section__header">
        <div className="team-section__title-row">
          <span className="team-section__flag" aria-hidden="true">{team.flag}</span>
          <h2 className="team-section__title">{team.name}</h2>
          <span className="team-section__group">Group {team.group}</span>
        </div>
        <div className="team-section__stats">
          <span className="team-section__stat team-section__stat--yellow">{counts.yellow}Y</span>
          <span className="team-section__stat team-section__stat--red">{counts.red}R</span>
          <span className="team-section__bank">{formatBank(bank)}</span>
          {isMine && <span className="team-section__mine-badge">Your team</span>}
        </div>
      </header>

      <div className="player-grid">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            team={team}
            isSelectedTeam={isMine}
            onClick={() => setActivePlayer({ player, team })}
          />
        ))}
      </div>

      {activePlayer && (
        <PlayerModal
          player={activePlayer.player}
          team={activePlayer.team}
          onClose={() => setActivePlayer(null)}
        />
      )}
    </section>
  )
}
