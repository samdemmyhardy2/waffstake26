import { useMemo } from 'react'
import { CardChip } from './CardChip'
import { getVisibleGamePlayers } from '../data/gamePlayers'
import { getAvailableCardsForPlayer, getPlayerTeamSlugs, type PlayerState } from '../utils/gameState'
import { buildLeaderboardRows, type LeaderboardRow } from '../utils/leaderboard'
import './PlayerRoster.css'

interface PlayerRosterProps {
  allStates: Record<string, PlayerState>
  activePlayerId: string
}

function TeamHoldingsCard({ team }: { team: LeaderboardRow }) {
  return (
    <article
      className="leaderboard-card player-roster__team-card"
      style={{
        ['--team-home' as string]: team.homeKit,
        ['--team-away' as string]: team.awayKit,
      }}
    >
      <div className="leaderboard-card__content">
        <p className="leaderboard-card__name">{team.name}</p>
        <p
          className="leaderboard-card__tally"
          aria-label={`${team.yellowCards} yellow cards, ${team.redCards} red cards`}
        >
          <span className="leaderboard-card__tally-item">
            <span className="leaderboard-card__card-chip leaderboard-card__card-chip--yellow" aria-hidden="true" />
            <span className="leaderboard-card__count">{team.yellowCards}</span>
          </span>
          <span className="leaderboard-card__tally-item">
            <span className="leaderboard-card__card-chip leaderboard-card__card-chip--red" aria-hidden="true" />
            <span className="leaderboard-card__count">{team.redCards}</span>
          </span>
        </p>
      </div>

      <div className="leaderboard-card__crest-wrap" aria-hidden="true">
        <span className="leaderboard-card__ring leaderboard-card__ring--outer" />
        <span className="leaderboard-card__ring leaderboard-card__ring--inner" />
        <img className="leaderboard-card__crest" src={team.crest} alt="" loading="lazy" />
      </div>
    </article>
  )
}

export function PlayerRoster({ allStates, activePlayerId }: PlayerRosterProps) {
  const rowsBySlug = useMemo(() => {
    return new Map(buildLeaderboardRows().map((team) => [team.slug, team]))
  }, [])

  const roster = useMemo(() => {
    return getVisibleGamePlayers().map((player) => {
      const state = allStates[player.id]
      const teams = (state ? getPlayerTeamSlugs(state) : [])
        .map((slug) => rowsBySlug.get(slug) ?? null)
        .filter((team): team is LeaderboardRow => team !== null)
      const bank = state ? getAvailableCardsForPlayer(state) : 0

      return { player, teams, bank }
    })
  }, [allStates, rowsBySlug])

  return (
    <section className="player-roster" aria-label="Who has what team">
      <h2 className="player-roster__title">Leaderboard</h2>

      <ul className="player-roster__list">
        {roster.map(({ player, teams, bank }) => {
          const isActive = player.id === activePlayerId

          return (
            <li
              key={player.id}
              className={`player-roster__entry${isActive ? ' player-roster__entry--active' : ''}`}
            >
              <div className="player-roster__name-row">
                <p
                  className={`player-roster__name${isActive ? ' player-roster__name--active' : ''}`}
                >
                  {player.name}
                </p>
                {teams.length > 0 && (
                  <span className="player-roster__bank">
                    <CardChip />
                    {bank} to spend
                  </span>
                )}
              </div>

              {teams.length > 0 ? (
                <div className="player-roster__teams">
                  {teams.map((team) => (
                    <TeamHoldingsCard key={team.slug} team={team} />
                  ))}
                </div>
              ) : (
                <p className="player-roster__empty">No team yet</p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
