import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const STATE_KEY = 'waffstake-game-state'
const ACTIVITY_KEY = 'waffstake-activity-feed'
const SYNC_CURSOR_KEY = 'waffstake-sync-cursor'
const SYNC_ROW_ID = 'waffstake2026'
const POLL_MS = 4000
const PUSH_DEBOUNCE_MS = 400

interface RemoteSyncRow {
  id: string
  game_state: unknown
  activity_feed: unknown
  updated_at: string
}

let client: SupabaseClient | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushInFlight = false
let applyingRemote = false
let initialPullDone = false

function getClient(): SupabaseClient | null {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  client = createClient(url, anonKey)
  return client
}

export function isGameSyncEnabled(): boolean {
  return Boolean(getClient())
}

function readSyncCursor(): string | null {
  try {
    return localStorage.getItem(SYNC_CURSOR_KEY)
  } catch {
    return null
  }
}

export function clearSyncCursor(): void {
  try {
    localStorage.removeItem(SYNC_CURSOR_KEY)
  } catch {
    // ignore storage errors
  }
}

function writeSyncCursor(updatedAt: string): void {
  try {
    localStorage.setItem(SYNC_CURSOR_KEY, updatedAt)
  } catch {
    // ignore storage errors
  }
}

function dispatchLocalUpdates(): void {
  window.dispatchEvent(new CustomEvent('waffstake-state-change'))
  window.dispatchEvent(new CustomEvent('waffstake-activity-change'))
}

function applyRemoteRow(row: RemoteSyncRow): boolean {
  const cursor = readSyncCursor()
  if (cursor && row.updated_at <= cursor) return false

  applyingRemote = true
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(row.game_state))
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(row.activity_feed))
    writeSyncCursor(row.updated_at)
    dispatchLocalUpdates()
    return true
  } finally {
    applyingRemote = false
  }
}

async function pullRemote(): Promise<void> {
  if (pushInFlight || applyingRemote) return

  const supabase = getClient()
  if (!supabase) {
    initialPullDone = true
    return
  }

  try {
    const { data, error } = await supabase
      .from('waffstake_sync')
      .select('id, game_state, activity_feed, updated_at')
      .eq('id', SYNC_ROW_ID)
      .maybeSingle()

    if (error || !data) return
    applyRemoteRow(data as RemoteSyncRow)
  } finally {
    initialPullDone = true
  }
}

async function pushRemote(): Promise<void> {
  const supabase = getClient()
  if (!supabase || applyingRemote) return

  const gameStateRaw = localStorage.getItem(STATE_KEY)
  const activityRaw = localStorage.getItem(ACTIVITY_KEY)
  if (!gameStateRaw) return

  let gameState: unknown
  let activityFeed: unknown
  try {
    gameState = JSON.parse(gameStateRaw)
    activityFeed = activityRaw ? JSON.parse(activityRaw) : []
  } catch {
    return
  }

  pushInFlight = true
  const updatedAt = new Date().toISOString()

  try {
    const { data, error } = await supabase
      .from('waffstake_sync')
      .upsert({
        id: SYNC_ROW_ID,
        game_state: gameState,
        activity_feed: activityFeed,
        updated_at: updatedAt,
      })
      .select('updated_at')
      .single()

    if (error || !data?.updated_at) return
    writeSyncCursor(data.updated_at)
  } finally {
    pushInFlight = false
  }
}

export function scheduleSyncPush(): void {
  if (!getClient() || applyingRemote || !initialPullDone) return

  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    pushTimer = null
    void pushRemote()
  }, PUSH_DEBOUNCE_MS)
}

export function initGameSync(): () => void {
  const supabase = getClient()
  if (!supabase) return () => {}

  void pullRemote()

  pollTimer = setInterval(() => {
    void pullRemote()
  }, POLL_MS)

  const onFocus = () => {
    void pullRemote()
  }
  window.addEventListener('focus', onFocus)

  return () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    if (pushTimer) clearTimeout(pushTimer)
    pushTimer = null
    window.removeEventListener('focus', onFocus)
  }
}
