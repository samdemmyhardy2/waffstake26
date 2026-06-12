import { GAME_PLAYERS } from '../data/gamePlayers'
import { assetUrl } from '../utils/baseUrl'
import { isGameSyncEnabled } from '../utils/gameSync'
import { STARTING_POINTS } from '../utils/gameState'
import { buildLeaderboardRows } from '../utils/leaderboard'
import './RulesPage.css'

function teamNameForSlug(slug: string): string {
  return buildLeaderboardRows().find((team) => team.slug === slug)?.name ?? slug
}

export function RulesPage() {
  const allocatedPlayers = GAME_PLAYERS.filter(
    (player) => player.defaultTeamSlug && !player.isTestPlayer,
  )

  return (
    <div className="rules rules--embedded">
      <header className="rules__header">
        <img
          className="rules__logo"
          src={assetUrl('/title.svg')}
          alt="WaffStake"
          width={317}
          height={38}
        />
      </header>

      <h2 className="rules__title">Rules</h2>

      <div className="rules__body">
        <section className="rules__section">
          <h3 className="rules__heading">The idea</h3>
          <p>Welcome to the 2026 version of The WAFFSTAKE.</p>
          <p>
            Basically.... Your teams earn yellow and red cards as they play. You spend yellow cards
            to buy more teams.
          </p>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Getting started</h3>
          <p>Pick your name when prompted.</p>
          <p>Players start with an allocated team (cost already deducted from your budget):</p>
          <table className="rules__table">
            <thead>
              <tr>
                <th scope="col">Player</th>
                <th scope="col">Team</th>
              </tr>
            </thead>
            <tbody>
              {allocatedPlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>{teamNameForSlug(player.defaultTeamSlug!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="rules__list">
            <li>Up to 2 more teams — buy cheaper teams from the Shop to fill extra slots.</li>
            <li>Only one player can own a team at a time.</li>
          </ul>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Yellow cards vs red cards</h3>
          <p>
            <strong>Yellow cards</strong> are what you spend to buy or steal teams. They come from
            your {STARTING_POINTS} bonus points plus yellows earned by teams in your squad.
          </p>
          <p>
            <strong>Red cards</strong> are never spent. They only matter for stealing: your{' '}
            <strong>total reds across your whole squad</strong> must be higher than theirs. If they
            have more reds than you, you cannot steal any of their teams.
          </p>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Your card bank</h3>
          <ul className="rules__list">
            <li>
              Everyone starts with <strong>{STARTING_POINTS} bonus points</strong> (not the same as
              yellow cards).
            </li>
            <li>
              Yellow cards from the tournament are added on top — counted across your whole squad.
            </li>
            <li>
              Available to spend = {STARTING_POINTS} + yellows across all your teams − the shop
              cost of each team in your squad.
            </li>
          </ul>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Shop prices (by team strength)</h3>
          <table className="rules__table">
            <thead>
              <tr>
                <th scope="col">Tier</th>
                <th scope="col">Cost</th>
                <th scope="col">Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Elite (top 6)</td>
                <td>12</td>
                <td>Argentina, Spain, France, England, Portugal, Brazil</td>
              </tr>
              <tr>
                <td>Strong (7–10)</td>
                <td>4</td>
                <td>Morocco, Netherlands, Belgium, Germany</td>
              </tr>
              <tr>
                <td>Contender (11–17)</td>
                <td>3</td>
                <td>Croatia, Colombia, Mexico, Senegal, Uruguay, USA, Japan</td>
              </tr>
              <tr>
                <td>Dark horse (18–27)</td>
                <td>2</td>
                <td>Switzerland through Canada</td>
              </tr>
              <tr>
                <td>Underdog (28+)</td>
                <td>1</td>
                <td>Everyone else</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Buying a team (unowned)</h3>
          <ul className="rules__list">
            <li>
              If you have a free slot and can afford it from your leftover budget, the team is added
              to your squad — even if it costs more than your top team (e.g. South Africa plus
              Belgium from budget).
            </li>
            <li>
              If you have a free slot and the team costs no more than your top team, it is also added
              to your squad.
            </li>
            <li>
              To buy a more expensive team using your squad&apos;s banks, you only give up the teams
              whose cards you needed — if one team already has enough (e.g. 12 yellows), the others
              can stay.
            </li>
            <li>
              If you need cards from across multiple teams, those teams go back to the shop and you
              only keep the team you bought.
            </li>
            <li>
              When your top team is replaced, you adopt the new team&apos;s card bank.
            </li>
          </ul>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Stealing a team (already owned)</h3>
          <ul className="rules__list">
            <li>Costs the same as buying that team.</li>
            <li>
              Your total red cards (all teams in your squad) must be higher than their total. If
              not, you cannot steal from them at all.
            </li>
            <li>
              Your other bought teams may be spent. You take their team as your new top team and
              adopt their card bank.
            </li>
            <li>If it was their top team, they get yours in return.</li>
            <li>No buying or stealing during live matches (see below).</li>
          </ul>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Game time (no swaps)</h3>
          <p>
            During a live World Cup match (from kickoff until about 130 minutes later, including
            extra time), no picking, buying, or stealing. The app will tell you when a match is live.
          </p>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Tabs</h3>
          <ul className="rules__list">
            <li>
              Home — countdown to next match, activity feed, who has what team and everyone&apos;s
              balance.
            </li>
            <li>Shop — buy or steal teams.</li>
            <li>Book — these rules.</li>
          </ul>
        </section>

        <section className="rules__section">
          <h3 className="rules__heading">Important</h3>
          <ul className="rules__list">
            <li>
              {isGameSyncEnabled()
                ? "Game progress syncs across everyone's phones. Pick your own name on each device."
                : "Game state is saved on your phone or browser — everyone needs to use the app on a shared device, or accept that phones won't sync with each other yet."}
            </li>
            <li>Check the Latest feed on Home to see who bought or stole what.</li>
            <li>Your balance and squad are shown at the top and on the home roster.</li>
          </ul>
        </section>

        <section className="rules__section rules__section--example">
          <h3 className="rules__heading">Quick example</h3>
          <p>Robs starts with Uruguay (3 pts) → 9 to spend.</p>
          <p>She buys an underdog (1 pt) → 8 left, Uruguay plus the underdog in her squad.</p>
          <p>
            She could also buy Belgium (4 pts) from that budget alone — Uruguay stays, Belgium is
            added.
          </p>
          <p>
            If one of her teams has 12 yellows on their own, she can buy France (12 pts) and keep her
            other two teams. If the 12 cards are spread across all three, those teams go back to the
            shop and she only keeps France.
          </p>
        </section>
      </div>
    </div>
  )
}
