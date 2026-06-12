import { GAME_PLAYERS } from '../data/gamePlayers'
import { assetUrl } from '../utils/baseUrl'
import type { PlayerState } from '../utils/gameState'
import { teamNameFromSlug } from '../utils/teamName'
import './PlayerSelectPage.css'

interface PlayerSelectPageProps {
  allStates: Record<string, PlayerState>
  onSelect: (playerId: string) => void
}

export function PlayerSelectPage({ allStates, onSelect }: PlayerSelectPageProps) {
  return (
    <div className="player-select">
      <header className="player-select__header">
        <img
          className="player-select__logo"
          src={assetUrl('/title.svg')}
          alt="WASSFSTAKE 26"
          width={896}
          height={205}
        />
        <h1 className="player-select__title">Who are you?</h1>
        <p className="player-select__hint">Pick your player — everyone shares the same game.</p>
      </header>

      <ul className="player-select__list">
        {GAME_PLAYERS.map((player) => {
          const state = allStates[player.id]
          const teamName = teamNameFromSlug(state?.selectedTeamSlug ?? null)

          const displayTeam =
            teamName === 'No team yet' && player.defaultTeamSlug
              ? teamNameFromSlug(player.defaultTeamSlug)
              : teamName

          return (
            <li key={player.id}>
              <button type="button" className="player-select__card" onClick={() => onSelect(player.id)}>
                <span className="player-select__name">
                  {player.name}
                  {player.isTestPlayer && <span className="player-select__badge">testing</span>}
                </span>
                <span className="player-select__team">{displayTeam}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
