import { useCallback, useState } from 'react'
import { assetUrl } from '../utils/baseUrl'
import { FloatingCards, WELCOME_MESSAGE_DELAY_MS } from './FloatingCards'
import './WelcomePage.css'

interface WelcomePageProps {
  onGetStarted: () => void
  entryEnabled?: boolean
}

export function WelcomePage({ onGetStarted, entryEnabled = false }: WelcomePageProps) {
  const [ctaBouncing, setCtaBouncing] = useState(false)

  const bounceCta = useCallback(() => {
    if (ctaBouncing) return
    setCtaBouncing(true)
  }, [ctaBouncing])

  return (
    <div className="welcome">
      <FloatingCards intro />

      <div className="welcome__content">
        <h1 className="welcome__title" aria-label="WaffStake">
          <img
            className="welcome__logo"
            src={assetUrl('/title.svg')}
            alt="WaffStake"
            width={317}
            height={38}
          />
        </h1>

        <p
          className="welcome__message"
          style={{ ['--message-delay' as string]: `${WELCOME_MESSAGE_DELAY_MS}ms` }}
        >
          Pick your player. Let the waff begin.
        </p>
      </div>

      <button
        type="button"
        className={`welcome__cta${ctaBouncing ? ' welcome__cta--bouncing' : ''}${!entryEnabled ? ' welcome__cta--disabled' : ''}`}
        onPointerDown={bounceCta}
        onClick={() => {
          if (entryEnabled) onGetStarted()
        }}
        aria-disabled={!entryEnabled}
        onAnimationEnd={(e) => {
          if (e.animationName === 'cta-bounce') setCtaBouncing(false)
        }}
      >
        🙌 Get Started 😈
      </button>
    </div>
  )
}
