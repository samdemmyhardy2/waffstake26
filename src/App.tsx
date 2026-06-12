import { useEffect, useState } from 'react'
import { WelcomePage } from './components/WelcomePage'
import { MainApp } from './components/MainApp'
import { appPath, isAppPath } from './utils/baseUrl'

type View = 'welcome' | 'app'

function getViewFromPath(): View {
  return isAppPath(window.location.pathname) ? 'app' : 'welcome'
}

function App() {
  const [view, setView] = useState<View>(getViewFromPath)

  useEffect(() => {
    const onPopState = () => setView(getViewFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goToApp = () => {
    window.history.pushState(null, '', appPath())
    setView('app')
  }

  if (view === 'welcome') {
    return <WelcomePage onGetStarted={goToApp} entryEnabled={false} />
  }

  return <MainApp />
}

export default App
