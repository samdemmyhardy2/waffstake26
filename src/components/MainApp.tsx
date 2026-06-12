import { useMemo, useState } from 'react'
import { DATA_AS_OF, teams } from '../data/teams'
import { Header } from './Header'
import { SweepstakePanel } from './SweepstakePanel'
import { SearchBar } from './SearchBar'
import { TeamNav } from './TeamNav'
import { TeamSection } from './TeamSection'
import { useSweepstake } from '../hooks/useSweepstake'
import '../App.css'

export function MainApp() {
  const { selectedTeamId, selectTeam } = useSweepstake()
  const [filterTeamId, setFilterTeamId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const visibleTeams = useMemo(() => {
    if (filterTeamId) return teams.filter((t) => t.id === filterTeamId)
    return teams
  }, [filterTeamId])

  const resultCount = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return visibleTeams.reduce((count, team) => {
      if (!query) return count + team.players.length
      return (
        count +
        team.players.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.position.toLowerCase().includes(query) ||
            p.club.toLowerCase().includes(query),
        ).length
      )
    }, 0)
  }, [visibleTeams, searchQuery])

  return (
    <div className="app">
      <Header />
      <SweepstakePanel
        teams={teams}
        selectedTeamId={selectedTeamId}
        onSelectTeam={selectTeam}
      />

      <div className="controls">
        <SearchBar value={searchQuery} onChange={setSearchQuery} resultCount={resultCount} />
        <TeamNav
          teams={teams}
          activeTeamId={filterTeamId}
          onSelectTeam={setFilterTeamId}
        />
      </div>

      <main className="main">
        {resultCount === 0 ? (
          <p className="empty-state">No players match your search.</p>
        ) : (
          visibleTeams.map((team) => (
            <TeamSection
              key={team.id}
              team={team}
              selectedTeamId={selectedTeamId}
              searchQuery={searchQuery}
            />
          ))
        )}
      </main>

      <footer className="site-footer">
        <p>WASSFSTAKE 26 · Card data as of {DATA_AS_OF}</p>
      </footer>
    </div>
  )
}
