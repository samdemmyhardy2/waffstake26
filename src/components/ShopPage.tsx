import { useMemo, useRef, useState } from 'react'
import { getGamePlayer, isTeamExcludedForPlayer } from '../data/gamePlayers'
import { useGameState } from '../hooks/useGameState'
import { useGameTime } from '../hooks/useGameTime'
import { assetUrl, type AppTab } from '../utils/baseUrl'
import {
  findTeamOwner,
  hasEmptyAdditionalSlot,
  MAX_ADDITIONAL_TEAMS,
  playerOwnsTeam,
  STARTING_POINTS,
} from '../utils/gameState'
import { gameTimeMessage } from '../utils/gameTime'
import { buildLeaderboardRows, type LeaderboardRow } from '../utils/leaderboard'
import { buildShopTeams } from '../utils/shopTeams'
import './LeaderboardPage.css'
import './TeamGridCard.css'
import './ShopPage.css'

interface ShopPageProps {
  onNavigate: (tab: AppTab) => void
  playerId: string
}

function TeamRosterCard({ team }: { team: LeaderboardRow }) {
  return (
    <article
      className="leaderboard-card shop__my-team"
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
        <img className="leaderboard-card__crest" src={team.crest} alt="" />
      </div>
    </article>
  )
}

export function ShopPage({ onNavigate, playerId }: ShopPageProps) {
  const { playerState, allStates, acquireTeamForPlayer } = useGameState()
  const gameTimeLocked = useGameTime()
  const shopGridRef = useRef<HTMLElement>(null)
  const teams = useMemo(
    () => buildShopTeams().filter((team) => !isTeamExcludedForPlayer(playerId, team.slug)),
    [playerId],
  )
  const leaderboardRows = useMemo(() => buildLeaderboardRows(), [])
  const [message, setMessage] = useState<string | null>(null)

  const redBySlug = useMemo(
    () => new Map(leaderboardRows.map((team) => [team.slug, team.redCards])),
    [leaderboardRows],
  )

  const selectedSlug = playerState?.selectedTeamSlug ?? null

  const selectedTeam = useMemo(
    () => leaderboardRows.find((team) => team.slug === selectedSlug) ?? null,
    [leaderboardRows, selectedSlug],
  )

  const additionalTeams = useMemo(() => {
    const slugs = playerState?.additionalTeamSlugs ?? []
    return slugs
      .map((slug) => leaderboardRows.find((team) => team.slug === slug) ?? null)
      .filter((team): team is LeaderboardRow => team !== null)
  }, [leaderboardRows, playerState?.additionalTeamSlugs])

  const emptyAdditionalSlots = Math.max(
    0,
    MAX_ADDITIONAL_TEAMS - (playerState?.additionalTeamSlugs.length ?? 0),
  )

  const additionalTeamsCost = useMemo(() => {
    const slugs = playerState?.additionalTeamSlugs ?? []
    return slugs.reduce((total, slug) => {
      const team = teams.find((t) => t.slug === slug)
      return total + (team?.cardsRequired ?? 0)
    }, 0)
  }, [playerState?.additionalTeamSlugs, teams])

  const availableCards = useMemo(() => {
    if (!selectedTeam || !playerState) return 0
    return Math.max(
      0,
      STARTING_POINTS +
        selectedTeam.yellowCards -
        playerState.cardsSpent -
        playerState.primaryTeamCost -
        additionalTeamsCost,
    )
  }, [selectedTeam, playerState, additionalTeamsCost])

  const myRedCards = selectedTeam?.redCards ?? 0

  const handleAcquire = (team: (typeof teams)[number]) => {
    if (gameTimeLocked) {
      setMessage(gameTimeMessage())
      return
    }

    if (!selectedTeam || !playerState) {
      setMessage('Select your team on the leaderboard first.')
      return
    }

    if (playerState && playerOwnsTeam(playerState, team.slug)) {
      setMessage(`You already have ${team.name}.`)
      return
    }

    if (availableCards < team.cardsRequired) {
      setMessage(`You need ${team.cardsRequired} yellow cards for ${team.name}.`)
      return
    }

    const ownerId = findTeamOwner(team.slug, playerId)
    const owner = ownerId ? getGamePlayer(ownerId) : null
    const ownerRedCards = ownerId
      ? (redBySlug.get(allStates[ownerId]?.selectedTeamSlug ?? '') ?? 0)
      : 0

    if (ownerId && myRedCards <= ownerRedCards) {
      setMessage(
        `You need more red cards than ${owner?.name ?? 'them'} (${ownerRedCards}) to steal ${team.name}.`,
      )
      return
    }

    const willAddToExtra = !ownerId && hasEmptyAdditionalSlot(playerState)

    const acquired = acquireTeamForPlayer(team.slug, team.cardsRequired, ownerId)
    if (!acquired) {
      setMessage(gameTimeMessage())
      return
    }

    if (ownerId && owner) {
      setMessage(`You stole ${team.name} from ${owner.name} for ${team.cardsRequired} cards.`)
      return
    }

    setMessage(
      willAddToExtra
        ? `You added ${team.name} for ${team.cardsRequired} cards.`
        : `You swapped to ${team.name} for ${team.cardsRequired} cards.`,
    )
  }

  const handleAddTeam = () => {
    if (gameTimeLocked) {
      setMessage(gameTimeMessage())
      return
    }

    if (!selectedTeam) {
      setMessage('Select your team on the leaderboard first.')
      return
    }

    setMessage('Pick a team below to add to your squad.')
    shopGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="shop shop--embedded">
      <header className="shop__header">
        <img
          className="shop__logo"
          src={assetUrl('/title.svg')}
          alt="WASSFSTAKE 26"
          width={896}
          height={205}
        />
      </header>

      {selectedTeam ? (
        <section className="shop__roster" aria-label="Your teams">
          <TeamRosterCard team={selectedTeam} />
          {additionalTeams.map((team) => (
            <TeamRosterCard key={team.slug} team={team} />
          ))}
          {Array.from({ length: emptyAdditionalSlots }, (_, index) => (
            <button
              key={`add-slot-${index}`}
              type="button"
              className="shop__add-team"
              onClick={handleAddTeam}
            >
              + Add a team
            </button>
          ))}
        </section>
      ) : (
        <p className="shop__prompt">
          Select your team on the{' '}
          <button type="button" className="shop__prompt-link" onClick={() => onNavigate('home')}>
            leaderboard
          </button>
          .
        </p>
      )}

      <h2 className="shop__title">Shop</h2>

      {gameTimeLocked && (
        <p className="shop__game-time" role="status">
          {gameTimeMessage()}
        </p>
      )}

      {message && (
        <p className="shop__message" role="status">
          {message}
        </p>
      )}

      <main ref={shopGridRef} className="team-grid shop__grid" aria-label="Teams for sale">
        {teams.map((team) => {
          const isCurrentTeam = playerState ? playerOwnsTeam(playerState, team.slug) : false
          const ownerId = findTeamOwner(team.slug, playerId)
          const owner = ownerId ? getGamePlayer(ownerId) : null
          const ownerRedCards = ownerId
            ? (redBySlug.get(allStates[ownerId]?.selectedTeamSlug ?? '') ?? 0)
            : 0
          const teamRedCards = redBySlug.get(team.slug) ?? 0
          const canAfford = availableCards >= team.cardsRequired
          const canSteal = !ownerId || myRedCards > ownerRedCards
          const canAcquire =
            !gameTimeLocked && Boolean(selectedTeam) && canAfford && canSteal && !isCurrentTeam
          const actionLabel = isCurrentTeam ? 'Owned' : ownerId ? 'Steal' : 'Buy'

          return (
            <article key={team.slug} className="team-grid-card">
              <div className="team-grid-card__image-wrap">
                <span className="team-grid-card__red-badge" aria-label={`${teamRedCards} red cards`}>
                  <span className="team-grid-card__red-chip" aria-hidden="true" />
                  <span className="team-grid-card__red-count">{teamRedCards}</span>
                </span>
                <img className="team-grid-card__crest" src={team.crest} alt="" loading="lazy" />
              </div>
              <div className="team-grid-card__info">
                <p className="team-grid-card__name-row">
                  <span className="team-grid-card__name">{team.name}</span>
                  <span className="team-grid-card__seed">(#{team.seed})</span>
                </p>
                {owner && (
                  <p className="team-grid-card__owner">Held by {owner.name}</p>
                )}
                <p className="team-grid-card__price">
                  <span className="team-grid-card__card-chip" aria-hidden="true" />
                  {team.cardsRequired} cards
                </p>
                <button
                  type="button"
                  className={`team-grid-card__buy${
                    isCurrentTeam
                      ? ' team-grid-card__buy--owned'
                      : !canAcquire
                        ? ' team-grid-card__buy--disabled'
                        : ownerId
                          ? ' team-grid-card__buy--steal'
                          : ''
                  }`}
                  onClick={() => handleAcquire(team)}
                  disabled={!canAcquire}
                >
                  {actionLabel}
                </button>
              </div>
            </article>
          )
        })}
      </main>
    </div>
  )
}
