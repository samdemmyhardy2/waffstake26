import { useEffect } from 'react'
import { CARD_VALUES, type Player, type Team } from '../types'
import { formatBank, playerCardTotal } from '../utils/bank'

interface PlayerModalProps {
  player: Player
  team: Team
  onClose: () => void
}

export function PlayerModal({ player, team, onClose }: PlayerModalProps) {
  const total = playerCardTotal(player)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <dialog
        className="player-modal"
        open
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="player-modal-title"
      >
        <button type="button" className="player-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="player-modal__header">
          <span className="player-modal__flag" aria-hidden="true">{team.flag}</span>
          <div>
            <h2 id="player-modal-title" className="player-modal__name">{player.name}</h2>
            <p className="player-modal__team">{team.name} · Group {team.group}</p>
          </div>
        </div>

        <dl className="player-modal__details">
          <div>
            <dt>Position</dt>
            <dd>{player.position}</dd>
          </div>
          <div>
            <dt>Club</dt>
            <dd>{player.club}</dd>
          </div>
        </dl>

        <div className="player-modal__cards">
          <h3>Cards</h3>
          <div className="player-modal__card-row">
            <div className="player-modal__card-stat player-modal__card-stat--yellow">
              <span className="player-modal__card-count">{player.yellowCards}</span>
              <span>Yellow</span>
              <span className="player-modal__card-value">£{player.yellowCards * CARD_VALUES.yellow}</span>
            </div>
            <div className="player-modal__card-stat player-modal__card-stat--red">
              <span className="player-modal__card-count">{player.redCards}</span>
              <span>Red</span>
              <span className="player-modal__card-value">£{player.redCards * CARD_VALUES.red}</span>
            </div>
          </div>
          {(player.yellowCards > 0 || player.redCards > 0) && (
            <p className="player-modal__total">Bank contribution: <strong>{formatBank(total)}</strong></p>
          )}
        </div>
      </dialog>
    </div>
  )
}
