import { useEffect, useState } from 'react'
import { WelcomePage } from './components/WelcomePage'
import { MainApp } from './components/MainApp'
import { appPath, isAppPath } from './utils/baseUrl'
import { clearActivePlayerId } from './utils/gameState'
import { initGameSync } from './utils/gameSync'

const ENTRY_ENABLED = true

type View = 'welcome' | 'app'

function App() {
  const [view, setView] = useState<View>('welcome')

  useEffect(() => {
    clearActivePlayerId()

    if (isAppPath(window.location.pathname)) {
      window.history.replaceState(null, '', import.meta.env.BASE_URL)
    }

    const onPopState = () => {
      if (!ENTRY_ENABLED) return

      if (isAppPath(window.location.pathname)) {
        setView('app')
      } else {
        clearActivePlayerId()
        setView('welcome')
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => initGameSync(), [])

  const goToApp = () => {
    clearActivePlayerId()
    window.history.pushState(null, '', appPath())
    setView('app')
  }

  if (view === 'welcome') {
    return <WelcomePage onGetStarted={goToApp} entryEnabled={ENTRY_ENABLED} />
  }

  return <MainApp />
}

export default App
