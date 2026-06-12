interface TeamNavProps {
  teams: { id: string; name: string; shortName: string; flag: string }[]
  activeTeamId: string | null
  onSelectTeam: (teamId: string | null) => void
}

export function TeamNav({ teams, activeTeamId, onSelectTeam }: TeamNavProps) {
  return (
    <nav className="team-nav" aria-label="Filter by team">
      <div className="team-nav__scroll">
        <button
          type="button"
          className={`team-nav__pill${activeTeamId === null ? ' team-nav__pill--active' : ''}`}
          onClick={() => onSelectTeam(null)}
        >
          All teams
        </button>
        {teams.map((team) => (
          <button
            key={team.id}
            type="button"
            className={`team-nav__pill${activeTeamId === team.id ? ' team-nav__pill--active' : ''}`}
            onClick={() => onSelectTeam(team.id)}
          >
            <span className="team-nav__flag" aria-hidden="true">{team.flag}</span>
            {team.shortName}
          </button>
        ))}
      </div>
    </nav>
  )
}
