import { useEffect, useState } from 'react'
import { WelcomePage } from './components/WelcomePage'
import { MainApp } from './components/MainApp'
import { clearActivePlayerId } from './utils/gameState'
import { initGameSync } from './utils/gameSync'

const ENTRY_ENABLED = true

type View = 'welcome' | 'app'

function App() {
  const [view, setView] = useState<View>('welcome')

  useEffect(() => {
    const resetToIntro = () => {
      clearActivePlayerId()
      setView('welcome')
    }

    resetToIntro()

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetToIntro()
    }

    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  useEffect(() => initGameSync(), [])

  const goToApp = () => {
    clearActivePlayerId()
    setView('app')
  }

  if (view === 'welcome') {
    return <WelcomePage onGetStarted={goToApp} entryEnabled={ENTRY_ENABLED} />
  }

  return <MainApp />
}

export default App
