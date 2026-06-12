import { useEffect, useState } from 'react'
import { WelcomePage } from './components/WelcomePage'
import { MainApp } from './components/MainApp'
import { appPath, isAppPath } from './utils/baseUrl'

const ENTRY_ENABLED = false

type View = 'welcome' | 'app'

function getViewFromPath(): View {
  if (!ENTRY_ENABLED) return 'welcome'
  return isAppPath(window.location.pathname) ? 'app' : 'welcome'
}

function App() {
  const [view, setView] = useState<View>(getViewFromPath)

  useEffect(() => {
    if (!ENTRY_ENABLED && isAppPath(window.location.pathname)) {
      window.history.replaceState(null, '', import.meta.env.BASE_URL)
    }

    const onPopState = () => setView(getViewFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goToApp = () => {
    window.history.pushState(null, '', appPath())
    setView('app')
  }

  if (view === 'welcome') {
    return <WelcomePage onGetStarted={goToApp} entryEnabled={ENTRY_ENABLED} />
  }

  return <MainApp />
}

export default App
