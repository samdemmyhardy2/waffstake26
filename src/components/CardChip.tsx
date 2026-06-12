import './CardChip.css'

interface CardChipProps {
  variant?: 'yellow' | 'red'
}

export function CardChip({ variant = 'yellow' }: CardChipProps) {
  return <span className={`card-chip card-chip--${variant}`} aria-hidden="true" />
}
