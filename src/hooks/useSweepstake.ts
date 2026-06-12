import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'wc2026-sweepstake-team'

export function useSweepstake() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (selectedTeamId) {
        localStorage.setItem(STORAGE_KEY, selectedTeamId)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore storage errors
    }
  }, [selectedTeamId])

  const selectTeam = useCallback((teamId: string | null) => {
    setSelectedTeamId(teamId)
  }, [])

  return { selectedTeamId, selectTeam }
}
