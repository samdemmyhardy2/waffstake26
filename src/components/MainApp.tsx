import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGamePlayer } from '../data/gamePlayers'
import { useGameState } from '../hooks/useGameState'
import {
  getAvailableCardsForPlayer,
  getLockedTeamCardsCost,
  getSquadRedCards,
  getSquadYellowCards,
} from '../utils/gameState'
import { FloatingCards } from './FloatingCards'
import { LeaderboardPage } from './LeaderboardPage'
import { PlayerBanner } from './PlayerBanner'
import { PlayerSelectPage } from './PlayerSelectPage'
import { RulesPage } from './RulesPage'
import { ShopPage } from './ShopPage'
import { TabBar } from './TabBar'
import { appTabFromPath, type AppTab } from '../utils/baseUrl'
import './MainApp.css'

export function MainApp() {
  const { playerId, playerState, allStates, selectPlayer, switchPlayer, resetPlayer } = useGameState()
  const [activeTab, setActiveTab] = useState<AppTab>(() => appTabFromPath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setActiveTab(appTabFromPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((tab: AppTab) => {
    setActiveTab(tab)
  }, [])

  const cardBank = useMemo(() => {
    if (!playerState?.selectedTeamSlug || !playerId) return null

    const availableCards = getAvailableCardsForPlayer(playerState)

    return {
      lockedInTeams: getLockedTeamCardsCost(playerState),
      matchYellows: getSquadYellowCards(playerState),
      redCards: getSquadRedCards(playerState),
      availableCards,
    }
  }, [playerState, playerId])

  const player = playerId ? getGamePlayer(playerId) : null
  const playerName = player?.name ?? 'Player'

  if (!playerId) {
    return (
      <div className="app-shell">
        <FloatingCards />
        <div className="app-frame">
          <PlayerSelectPage allStates={allStates} onSelect={selectPlayer} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <FloatingCards />
      <div className="app-frame">
      <PlayerBanner
        playerName={playerName}
        isTestPlayer={player?.isTestPlayer}
        onSwitchPlayer={switchPlayer}
        onResetPlayer={resetPlayer}
        cardBank={cardBank}
      />

      <div className="app-frame__content">
        {activeTab === 'shop' ? (
          <ShopPage onNavigate={navigate} playerId={playerId} />
        ) : activeTab === 'profile' ? (
          <RulesPage />
        ) : (
          <LeaderboardPage playerId={playerId} />
        )}
      </div>

      <TabBar activeTab={activeTab} onNavigate={navigate} />
      </div>
    </div>
  )
}
