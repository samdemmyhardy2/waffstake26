import { useNextMatchCountdown } from '../hooks/useNextMatchCountdown'
import './MatchCountdown.css'

export function MatchCountdown() {
  const { match, countdown } = useNextMatchCountdown()

  if (!match || !countdown) return null

  return (
    <section className="match-countdown" aria-label={`Next match: ${match.label}`}>
      <p className="match-countdown__time" aria-live="polite">
        {countdown.hoursWord.split(' ').map((line, index) => (
          <span key={`hour-${index}`} className="match-countdown__line">
            {line}
          </span>
        ))}
        <span className="match-countdown__line">HOURS</span>
        {countdown.minutesWord.split(' ').map((line, index) => (
          <span key={`minute-${index}`} className="match-countdown__line">
            {line}
          </span>
        ))}
        <span className="match-countdown__line">MINUTES</span>
      </p>

      <div className="match-countdown__teams" aria-hidden="true">
        <div className="match-countdown__crest-wrap">
          {match.homeCrest ? (
            <img className="match-countdown__crest" src={match.homeCrest} alt="" />
          ) : (
            <span className="match-countdown__crest-fallback" />
          )}
        </div>
        <span className="match-countdown__versus">V</span>
        <div className="match-countdown__crest-wrap">
          {match.awayCrest ? (
            <img className="match-countdown__crest" src={match.awayCrest} alt="" />
          ) : (
            <span className="match-countdown__crest-fallback" />
          )}
        </div>
      </div>
    </section>
  )
}
