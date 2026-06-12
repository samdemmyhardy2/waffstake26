import { assetUrl } from '../utils/baseUrl'

export function Header() {
  return (
    <header className="site-header">
      <img
        className="site-header__logo"
        src={assetUrl('/title.svg')}
        alt="WASSFSTAKE 26 — Get yer yellows on"
        width={896}
        height={205}
      />
    </header>
  )
}
