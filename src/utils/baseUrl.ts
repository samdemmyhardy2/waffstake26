export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export type AppTab = 'home' | 'shop' | 'profile'

export function appPath(): string {
  const base = import.meta.env.BASE_URL
  return base === '/' ? '/app' : `${base}app`.replace(/\/+/g, '/')
}

export function appTabPath(tab: AppTab): string {
  if (tab === 'home') return appPath()
  return `${appPath()}/${tab}`.replace(/\/+/g, '/')
}

export function isAppPath(pathname: string): boolean {
  const app = appPath()
  return pathname === app || pathname.startsWith(`${app}/`)
}

export function appTabFromPath(pathname: string): AppTab {
  if (!isAppPath(pathname)) return 'home'
  if (pathname.includes('/shop')) return 'shop'
  if (pathname.includes('/profile')) return 'profile'
  return 'home'
}
