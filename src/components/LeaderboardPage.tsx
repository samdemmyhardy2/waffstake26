import { useMemo, useState } from 'react'
import { isTeamExcludedForPlayer } from '../data/gamePlayers'
import { useGameState } from '../hooks/useGameState'
import { useGameTime } from '../hooks/useGameTime'
import { DATA_AS_OF } from '../data/teams'
import { assetUrl } from '../utils/baseUrl'
import { getPlayerTeamSlugs } from '../utils/gameState'
import { buildLeaderboardRows } from '../utils/leaderboard'
import { gameTimeMessage } from '../utils/gameTime'
import { ActivityFeed } from './ActivityFeed'
import { MatchCountdown } from './MatchCountdown'
import { PlayerRoster } from './PlayerRoster'
import './LeaderboardPage.css'

interface LeaderboardPageProps {
  playerId: string
}

export function LeaderboardPage({ playerId }: LeaderboardPageProps) {
  const { playerState, allStates, selectTeam } = useGameState()
  const gameTimeLocked = useGameTime()
  const [message, setMessage] = useState<string | null>(null)
  const rows = useMemo(
    () => buildLeaderboardRows().filter((team) => !isTeamExcludedForPlayer(playerId, team.slug)),
    [playerId],
  )

  const selectedSlug = playerState?.selectedTeamSlug ?? null
  const hasTeam = Boolean(selectedSlug)

  const ownedSlugs = useMemo(() => {
    const slugs = new Set<string>()
    for (const state of Object.values(allStates)) {
      for (const slug of getPlayerTeamSlugs(state)) {
        slugs.add(slug)
      }
    }
    return slugs
  }, [allStates])

  const pickableTeams = useMemo(
    () => rows.filter((team) => !ownedSlugs.has(team.slug)),
    [rows, ownedSlugs],
  )

  const handleSelectTeam = (slug: string) => {
    if (hasTeam) return
    if (gameTimeLocked) {
      setMessage(gameTimeMessage())
      return
    }
    selectTeam(slug)
    setMessage(null)
  }

  return (
    <div className="leaderboard leaderboard--embedded">
      <header className="leaderboard__header">
        <img
          className="leaderboard__logo"
          src={assetUrl('/title.svg')}
          alt="WaffStake"
          width={317}
          height={38}
        />
      </header>

      <MatchCountdown />

      <ActivityFeed />

      {gameTimeLocked && !hasTeam && (
        <p className="leaderboard__game-time">{gameTimeMessage()}</p>
      )}

      {message && (
        <p className="leaderboard__message" role="status">
          {message}
        </p>
      )}

      {!hasTeam && (
        <section className="leaderboard__pick" aria-label="Pick your first team">
          <h2 className="leaderboard__pick-title">Pick your team</h2>
          <div className="leaderboard__pick-list">
            {pickableTeams.map((team) => {
              const cardStyle = {
                ['--team-home' as string]: team.homeKit,
                ['--team-away' as string]: team.awayKit,
              }

              return (
                <button
                  key={team.slug}
                  type="button"
                  className="leaderboard-card"
                  style={cardStyle}
                  disabled={gameTimeLocked}
                  onClick={() => handleSelectTeam(team.slug)}
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
                </button>
              )
            })}
          </div>
        </section>
      )}

      <main className="leaderboard__list">
        <PlayerRoster allStates={allStates} activePlayerId={playerId} />
      </main>

      <p className="leaderboard__meta">Card data as of {DATA_AS_OF}</p>
    </div>
  )
}
