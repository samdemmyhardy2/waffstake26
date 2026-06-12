import { CARD_VALUES, type Team } from '../types'
import { formatBank, teamBank, teamCardCounts } from '../utils/bank'

interface SweepstakePanelProps {
  teams: Team[]
  selectedTeamId: string | null
  onSelectTeam: (teamId: string | null) => void
}

export function SweepstakePanel({ teams, selectedTeamId, onSelectTeam }: SweepstakePanelProps) {
  const selectedTeam = teams.find((t) => t.id === selectedTeamId)
  const bank = selectedTeam ? teamBank(selectedTeam) : 0
  const counts = selectedTeam ? teamCardCounts(selectedTeam) : { yellow: 0, red: 0 }

  const leaderboard = [...teams]
    .map((team) => ({ team, bank: teamBank(team) }))
    .sort((a, b) => b.bank - a.bank)

  const rank = selectedTeam
    ? leaderboard.findIndex((entry) => entry.team.id === selectedTeam.id) + 1
    : null

  return (
    <section className="sweepstake" aria-label="Sweepstake">
      <div className="sweepstake__inner">
        <div className="sweepstake__picker">
          <label className="sweepstake__label" htmlFor="team-select">
            Your team
          </label>
          <select
            id="team-select"
            className="sweepstake__select"
            value={selectedTeamId ?? ''}
            onChange={(e) => onSelectTeam(e.target.value || null)}
          >
            <option value="">Choose a team…</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.flag} {team.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTeam ? (
          <div className="sweepstake__bank">
            <div className="sweepstake__bank-header">
              <span className="sweepstake__bank-team">
                {selectedTeam.flag} {selectedTeam.name}
              </span>
              {rank !== null && (
                <span className="sweepstake__rank">#{rank} of {teams.length}</span>
              )}
            </div>
            <p className="sweepstake__bank-amount">{formatBank(bank)}</p>
            <p className="sweepstake__bank-detail">
              {counts.yellow} yellow{counts.yellow !== 1 ? 's' : ''} · {counts.red} red{counts.red !== 1 ? 's' : ''}
            </p>
            <p className="sweepstake__rules">
              £{CARD_VALUES.yellow} per yellow · £{CARD_VALUES.red} per red
            </p>
          </div>
        ) : (
          <div className="sweepstake__prompt">
            <p>Select a team to track your sweepstake bank as cards are issued.</p>
          </div>
        )}
      </div>
    </section>
  )
}
