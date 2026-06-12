import { useEffect, useState } from 'react'
import { isGameTime } from '../utils/gameTime'

export function useGameTime(): boolean {
  const [locked, setLocked] = useState(() => isGameTime())

  useEffect(() => {
    const tick = () => setLocked(isGameTime())
    tick()
    const timer = window.setInterval(tick, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return locked
}
