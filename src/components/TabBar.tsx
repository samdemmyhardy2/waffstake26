import { assetUrl } from '../utils/baseUrl'
import type { AppTab } from '../utils/baseUrl'
import './TabBar.css'

interface TabBarProps {
  activeTab: AppTab
  onNavigate: (tab: AppTab) => void
}

export function TabBar({ activeTab, onNavigate }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="Main navigation">
      <button
        type="button"
        className={`tabbar__tab${activeTab === 'home' ? ' tabbar__tab--active' : ''}`}
        aria-label="Home"
        aria-current={activeTab === 'home' ? 'page' : undefined}
        onClick={() => onNavigate('home')}
      >
        <img src={assetUrl('/nav/home.svg')} alt="" width={21} height={22} />
      </button>
      <button
        type="button"
        className={`tabbar__tab${activeTab === 'shop' ? ' tabbar__tab--active' : ''}`}
        aria-label="Shop"
        aria-current={activeTab === 'shop' ? 'page' : undefined}
        onClick={() => onNavigate('shop')}
      >
        <img src={assetUrl('/nav/shop.svg')} alt="" width={21} height={23} />
      </button>
      <button
        type="button"
        className={`tabbar__tab${activeTab === 'profile' ? ' tabbar__tab--active' : ''}`}
        aria-label="Rules"
        aria-current={activeTab === 'profile' ? 'page' : undefined}
        onClick={() => onNavigate('profile')}
      >
        <img src={assetUrl('/nav/profile.svg')} alt="" width={22} height={23} />
      </button>
    </nav>
  )
}
