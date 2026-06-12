import { CardChip } from './CardChip'
import './PlayerBanner.css'

interface PlayerBannerProps {
  playerName: string
  isTestPlayer?: boolean
  onSwitchPlayer: () => void
  onResetPlayer?: () => void
  cardBank?: {
    lockedInTeams: number
    matchYellows: number
    redCards: number
    availableCards: number
  } | null
}

export function PlayerBanner({
  playerName,
  isTestPlayer,
  onSwitchPlayer,
  onResetPlayer,
  cardBank,
}: PlayerBannerProps) {
  return (
    <div className="player-banner">
      {cardBank && (
        <p className="player-banner__balance" aria-live="polite">
          <span className="player-banner__balance-part player-banner__balance-part--primary">
            <CardChip />
            <strong>{cardBank.availableCards}</strong> to spend
          </span>
          <span className="player-banner__balance-part">
            · <CardChip />
            {cardBank.lockedInTeams} on teams
          </span>
          <span className="player-banner__balance-part">
            · <CardChip />
            {cardBank.matchYellows} from matches
          </span>
          <span className="player-banner__balance-part">
            · <CardChip variant="red" />
            {cardBank.redCards} red
          </span>
        </p>
      )}
      <div className="player-banner__row">
        <span className="player-banner__name">
          {playerName}
          {isTestPlayer && <span className="player-banner__badge">testing</span>}
        </span>
        <div className="player-banner__actions">
          {isTestPlayer && onResetPlayer && (
            <button type="button" className="player-banner__reset" onClick={onResetPlayer}>
              Reset all
            </button>
          )}
          <button type="button" className="player-banner__switch" onClick={onSwitchPlayer}>
            Switch player
          </button>
        </div>
      </div>
    </div>
  )
}
