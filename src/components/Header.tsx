import { assetUrl } from '../utils/baseUrl'

export function Header() {
  return (
    <header className="site-header">
      <img
        className="site-header__logo"
        src={assetUrl('/title.svg')}
        alt="WaffStake"
        width={317}
        height={38}
      />
    </header>
  )
}
