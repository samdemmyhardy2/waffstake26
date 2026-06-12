export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function appPath(): string {
  const base = import.meta.env.BASE_URL
  return base === '/' ? '/app' : `${base}app`.replace(/\/+/g, '/')
}

export function isAppPath(pathname: string): boolean {
  return pathname === appPath() || pathname.endsWith('/app')
}
