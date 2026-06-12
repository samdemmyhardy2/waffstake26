import { useCallback, useEffect, useState } from 'react'
import { getGamePlayer } from '../data/gamePlayers'
import {
  clearActivePlayerId,
  getActivePlayerId,
  getActivePlayerState,
  getAllPlayerStates,
  getPlayerState,
  acquireTeam,
  resetAllGameState,
  setActivePlayerId,
  setSelectedTeamSlug,
  subscribeGameState,
  type PlayerState,
} from '../utils/gameState'

export function useGameState() {
  const [playerId, setPlayerId] = useState<string | null>(() => getActivePlayerId())
  const [playerState, setPlayerState] = useState<PlayerState | null>(() => getActivePlayerState())
  const [allStates, setAllStates] = useState(() => getAllPlayerStates())

  const refresh = useCallback(() => {
    const activeId = getActivePlayerId()
    setPlayerId(activeId)
    setPlayerState(activeId ? getPlayerState(activeId) : null)
    setAllStates(getAllPlayerStates())
  }, [])

  useEffect(() => {
    refresh()
    return subscribeGameState(refresh)
  }, [refresh])

  const selectPlayer = useCallback(
    (id: string) => {
      setActivePlayerId(id)
      refresh()
    },
    [refresh],
  )

  const selectTeam = useCallback(
    (slug: string) => {
      if (!playerId) return
      setSelectedTeamSlug(playerId, slug)
      refresh()
    },
    [playerId, refresh],
  )

  const acquireTeamForPlayer = useCallback(
    (slug: string, cost: number, defenderId: string | null) => {
      if (!playerId) return false
      const ok = acquireTeam(playerId, slug, cost, defenderId)
      if (ok) refresh()
      return ok
    },
    [playerId, refresh],
  )

  const switchPlayer = useCallback(() => {
    clearActivePlayerId()
    refresh()
  }, [refresh])

  const resetPlayer = useCallback(() => {
    if (!playerId) return
    const player = getGamePlayer(playerId)
    if (!player?.isTestPlayer) return
    resetAllGameState()
    refresh()
  }, [playerId, refresh])

  return {
    playerId,
    playerState,
    allStates,
    selectPlayer,
    selectTeam,
    acquireTeamForPlayer,
    switchPlayer,
    resetPlayer,
    refresh,
  }
}
