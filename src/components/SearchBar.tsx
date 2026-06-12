interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
}

export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label className="visually-hidden" htmlFor="player-search">
        Search players
      </label>
      <input
        id="player-search"
        type="search"
        className="search-bar__input"
        placeholder="Search players, clubs, positions…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />
      <span className="search-bar__count" aria-live="polite">
        {resultCount} player{resultCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
