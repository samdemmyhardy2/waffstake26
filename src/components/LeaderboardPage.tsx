import { useMemo } from 'react'
import { DATA_AS_OF } from '../data/teams'
import { assetUrl } from '../utils/baseUrl'
import { buildLeaderboardRows } from '../utils/leaderboard'
import './LeaderboardPage.css'

export function LeaderboardPage() {
  const rows = useMemo(() => buildLeaderboardRows(), [])

  return (
    <div className="leaderboard">
      <header className="leaderboard__header">
        <img
          className="leaderboard__logo"
          src={assetUrl('/title.svg')}
          alt="WASSFSTAKE 26"
          width={317}
          height={38}
        />
        <h1 className="leaderboard__title">Leaderboard</h1>
      </header>

      <main className="leaderboard__list" aria-label="Team card leaderboard">
        {rows.map((team) => (
          <article
            key={team.slug}
            className="leaderboard-card"
            style={{
              ['--team-home' as string]: team.homeKit,
              ['--team-away' as string]: team.awayKit,
            }}
          >
            <div className="leaderboard-card__content">
              <p className="leaderboard-card__name">{team.name}</p>
              <p className="leaderboard-card__tally" aria-label={`${team.yellowCards} yellow cards, ${team.redCards} red cards`}>
                <span className="leaderboard-card__count">{team.yellowCards}Y</span>
                <span className="leaderboard-card__sep">·</span>
                <span className="leaderboard-card__count">{team.redCards}R</span>
              </p>
            </div>

            <div className="leaderboard-card__crest-wrap" aria-hidden="true">
              <span className="leaderboard-card__ring leaderboard-card__ring--outer" />
              <span className="leaderboard-card__ring leaderboard-card__ring--inner" />
              <img className="leaderboard-card__crest" src={team.crest} alt="" loading="lazy" />
            </div>
          </article>
        ))}
      </main>

      <footer className="leaderboard__tabbar" aria-hidden="true">
        <span className="leaderboard__tab leaderboard__tab--active" />
        <span className="leaderboard__tab" />
        <span className="leaderboard__tab" />
      </footer>

      <p className="leaderboard__meta">Card data as of {DATA_AS_OF}</p>
    </div>
  )
}
