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
        <h1 className="welcome__title" aria-label="The Waff Stake 2026">
          <img
            className="welcome__word welcome__word--the welcome__word--1"
            src={assetUrl('/welcome/the.svg')}
            alt="The"
            width={133}
            height={66}
          />
          <img
            className="welcome__word welcome__word--2"
            src={assetUrl('/welcome/waff.svg')}
            alt="Waff"
            width={300}
            height={100}
          />
          <img
            className="welcome__word welcome__word--3"
            src={assetUrl('/welcome/stake.svg')}
            alt="Stake"
            width={295}
            height={93}
          />
          <img
            className="welcome__word welcome__word--4"
            src={assetUrl('/welcome/2026.svg')}
            alt="2026"
            width={296}
            height={111}
          />
        </h1>

        <p
          className="welcome__message"
          style={{ ['--message-delay' as string]: `${WELCOME_MESSAGE_DELAY_MS}ms` }}
        >
          Please wait, the online webstore is under construction
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
