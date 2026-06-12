import { useCallback, useEffect, useRef, useState } from 'react'
import './FloatingCards.css'

const YEAR_APPEAR_MS = 4000

const FALLING_CARDS: Omit<CardPiece, 'flutter'>[] = Array.from({ length: 32 }, (_, i) => ({
  id: `init-${i}`,
  color: (i % 3 === 0 ? 'red' : 'yellow') as CardColor,
  left: `${4 + ((i * 23) % 88)}%`,
  delay: (i * 0.07) % 1.4,
  duration: 1.7 + (i % 6) * 0.22,
  rotate: -28 + (i % 13) * 4,
  drift: -40 + (i % 9) * 12,
  scale: 0.85 + (i % 4) * 0.12,
  pile: 2 + (i % 6) * 4 + Math.floor(i / 6) * 7,
}))

const MESSAGE_APPEAR_MS = FALLING_CARDS.reduce((max, card) => {
  const cardEnd = YEAR_APPEAR_MS + card.delay * 1000 + card.duration * 1000
  return Math.max(max, cardEnd)
}, YEAR_APPEAR_MS + 450)

const INTRO_COMPLETE_MS = MESSAGE_APPEAR_MS + 800

export const WELCOME_MESSAGE_DELAY_MS = MESSAGE_APPEAR_MS

type CardColor = 'yellow' | 'red'

interface CardPiece {
  id: string
  color: CardColor
  left: string
  duration: number
  delay: number
  rotate: number
  drift: number
  scale: number
  pile: number
  flutter?: boolean
}

function randomDriftCard(id: string): CardPiece {
  return {
    id,
    color: Math.random() > 0.35 ? 'yellow' : 'red',
    left: `${4 + Math.random() * 88}%`,
    duration: 4.5 + Math.random() * 3.5,
    delay: 0,
    rotate: -32 + Math.random() * 64,
    drift: -55 + Math.random() * 110,
    scale: 0.8 + Math.random() * 0.35,
    pile: 2 + Math.random() * 90,
    flutter: true,
  }
}

interface FloatingCardsProps {
  intro?: boolean
}

export function FloatingCards({ intro = false }: FloatingCardsProps) {
  const driftIdRef = useRef(0)
  const footballTapRef = useRef(new Set<string>())
  const [landedCards, setLandedCards] = useState<Set<string>>(new Set())
  const [footballCards, setFootballCards] = useState<Set<string>>(new Set())
  const [footballDrops, setFootballDrops] = useState<
    Record<string, { startTop: number; startTransform: string }>
  >({})
  const [driftCards, setDriftCards] = useState<CardPiece[]>([])
  const [introComplete, setIntroComplete] = useState(!intro)

  useEffect(() => {
    if (!intro) return

    const timer = window.setTimeout(() => setIntroComplete(true), INTRO_COMPLETE_MS)
    return () => window.clearTimeout(timer)
  }, [intro])

  useEffect(() => {
    if (!introComplete) return

    const spawn = () => {
      driftIdRef.current += 1
      setDriftCards((prev) => {
        const next = [...prev, randomDriftCard(`drift-${driftIdRef.current}`)]
        return next.length > 20 ? next.slice(-20) : next
      })
    }

    spawn()
    const interval = window.setInterval(spawn, 1800 + Math.random() * 1400)
    return () => window.clearInterval(interval)
  }, [introComplete])

  const turnToFootball = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>, cardId: string, landed: boolean) => {
      if (footballTapRef.current.has(cardId)) return
      footballTapRef.current.add(cardId)

      setFootballCards((prev) => new Set(prev).add(cardId))

      if (!landed) {
        const el = e.currentTarget
        const parent = el.offsetParent as HTMLElement
        const parentRect = parent.getBoundingClientRect()
        const rect = el.getBoundingClientRect()

        setFootballDrops((prev) => ({
          ...prev,
          [cardId]: {
            startTop: rect.top - parentRect.top,
            startTransform: window.getComputedStyle(el).transform,
          },
        }))
      }
    },
    [],
  )

  const allCards: CardPiece[] = [
    ...(intro ? FALLING_CARDS.map((card) => ({ ...card, flutter: false })) : []),
    ...driftCards,
  ]

  return (
    <div className="floating-cards" aria-hidden="true">
      {allCards.map((card) => {
        const landed = landedCards.has(card.id)
        const isFootball = footballCards.has(card.id)
        const isDropping = Boolean(footballDrops[card.id])
        const isInit = intro && !card.flutter

        return (
          <span
            key={card.id}
            role="presentation"
            className={[
              'floating-cards__card',
              `floating-cards__card--${card.color}`,
              card.flutter && !isFootball ? 'floating-cards__card--flutter' : '',
              landed ? 'floating-cards__card--landed' : '',
              isFootball ? 'floating-cards__card--football' : '',
              isDropping ? 'floating-cards__card--football-drop' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: card.left,
              ['--card-rotate' as string]: `${card.rotate}deg`,
              ['--card-settle-rotate' as string]: `${card.rotate + 160}deg`,
              ['--card-drift' as string]: `${card.drift}px`,
              ['--card-scale' as string]: card.scale,
              ['--card-pile' as string]: `${card.pile}px`,
              ...(isDropping
                ? {
                    ['--football-start-top' as string]: `${footballDrops[card.id].startTop}px`,
                    ['--football-start-transform' as string]: footballDrops[card.id].startTransform,
                  }
                : {}),
              ...(!isDropping
                ? {
                    animationDuration: `${card.duration}s`,
                    animationDelay: isInit ? `${YEAR_APPEAR_MS + card.delay * 1000}ms` : '0ms',
                  }
                : {}),
            }}
            onPointerDown={(e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return
              turnToFootball(e, card.id, landed)
            }}
            onAnimationEnd={(e) => {
              if (e.animationName === 'card-fall' || e.animationName === 'card-flutter') {
                setLandedCards((prev) => new Set(prev).add(card.id))
              }
              if (e.animationName === 'football-floor-bounce') {
                setLandedCards((prev) => new Set(prev).add(card.id))
              }
            }}
          />
        )
      })}
    </div>
  )
}
