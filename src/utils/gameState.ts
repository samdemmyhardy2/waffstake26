import { GAME_PLAYERS, getGamePlayer } from '../data/gamePlayers'
import { TEAM_SEED_BY_SLUG, cardsRequiredForSeed } from '../data/teamSeeds'
import { appendActivity, clearActivityFeed } from './activityFeed'
import { buildLeaderboardRows } from './leaderboard'
import { isGameTime } from './gameTime'
import { buildShopTeams } from './shopTeams'

export const MAX_ADDITIONAL_TEAMS = 2
export const STARTING_POINTS = 12

export interface PlayerState {
  selectedTeamSlug: string | null
  additionalTeamSlugs: string[]
  cardsSpent: number
  primaryTeamCost: number
}

interface GameState {
  players: Record<string, PlayerState>
}

const STATE_KEY = 'waffstake-game-state'
const ACTIVE_PLAYER_KEY = 'waffstake-active-player'
const GAME_DATA_VERSION_KEY = 'waffstake-data-version'
const GAME_DATA_VERSION = 1

const LEGACY_KEYS = {
  selectedTeam: 'waffstake-selected-team',
  cardsSpent: 'waffstake-cards-spent',
  ownedTeams: 'waffstake-owned-teams',
  ownedTeam: 'waffstake-owned-team',
} as const

const DEFAULT_PLAYER_STATE: PlayerState = {
  selectedTeamSlug: null,
  additionalTeamSlugs: [],
  cardsSpent: 0,
  primaryTeamCost: 0,
}

function normalizeAdditionalSlugs(
  slugs: unknown,
  primarySlug: string | null,
): string[] {
  if (!Array.isArray(slugs)) return []

  const seen = new Set<string>()
  const normalized: string[] = []

  for (const slug of slugs) {
    if (typeof slug !== 'string' || slug === primarySlug || seen.has(slug)) continue
    seen.add(slug)
    normalized.push(slug)
    if (normalized.length >= MAX_ADDITIONAL_TEAMS) break
  }

  return normalized
}

export function getPlayerTeamSlugs(state: PlayerState): string[] {
  const slugs: string[] = []
  if (state.selectedTeamSlug) slugs.push(state.selectedTeamSlug)
  for (const slug of state.additionalTeamSlugs) {
    if (!slugs.includes(slug)) slugs.push(slug)
  }
  return slugs
}

export function playerOwnsTeam(state: PlayerState, teamSlug: string): boolean {
  return getPlayerTeamSlugs(state).includes(teamSlug)
}

export function hasEmptyAdditionalSlot(state: PlayerState): boolean {
  return state.additionalTeamSlugs.length < MAX_ADDITIONAL_TEAMS
}

export function getAvailableCardsForPlayer(state: PlayerState): number {
  if (!state.selectedTeamSlug) return 0

  const selectedTeam = buildLeaderboardRows().find((team) => team.slug === state.selectedTeamSlug)
  if (!selectedTeam) return 0

  const shopTeams = buildShopTeams()
  const additionalTeamsCost = state.additionalTeamSlugs.reduce((total, slug) => {
    const team = shopTeams.find((entry) => entry.slug === slug)
    return total + (team?.cardsRequired ?? 0)
  }, 0)

  return Math.max(
    0,
    STARTING_POINTS +
      selectedTeam.yellowCards -
      state.cardsSpent -
      state.primaryTeamCost -
      additionalTeamsCost,
  )
}

function primaryTeamCostForSlug(slug: string): number {
  const seed = TEAM_SEED_BY_SLUG[slug] ?? 48
  return cardsRequiredForSeed(seed)
}

function defaultStateForPlayer(playerId: string): PlayerState {
  const player = getGamePlayer(playerId)
  const slug = player?.defaultTeamSlug ?? null
  const primaryTeamCost = slug ? primaryTeamCostForSlug(slug) : 0

  return {
    selectedTeamSlug: slug,
    additionalTeamSlugs: [],
    cardsSpent: 0,
    primaryTeamCost,
  }
}

function emptyState(): GameState {
  return {
    players: Object.fromEntries(
      GAME_PLAYERS.map((player) => [player.id, defaultStateForPlayer(player.id)]),
    ),
  }
}

function applyGameDataMigrations(): void {
  try {
    if (localStorage.getItem(GAME_DATA_VERSION_KEY) === String(GAME_DATA_VERSION)) return
    writeState(emptyState())
    clearActivityFeed()
    localStorage.setItem(GAME_DATA_VERSION_KEY, String(GAME_DATA_VERSION))
  } catch {
    // ignore migration errors
  }
}

function readState(): GameState {
  applyGameDataMigrations()

  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return migrateLegacyState(emptyState())

    const parsed = JSON.parse(raw) as GameState
    if (!parsed.players || typeof parsed.players !== 'object') {
      return migrateLegacyState(emptyState())
    }

    const players = { ...emptyState().players }
    for (const player of GAME_PLAYERS) {
      const saved = parsed.players[player.id]
      const fallback = defaultStateForPlayer(player.id)
      const selectedTeamSlug =
        typeof saved?.selectedTeamSlug === 'string'
          ? saved.selectedTeamSlug
          : fallback.selectedTeamSlug

      let primaryTeamCost =
        typeof saved?.primaryTeamCost === 'number'
          ? saved.primaryTeamCost
          : fallback.primaryTeamCost

      if (
        primaryTeamCost === 0 &&
        selectedTeamSlug === fallback.selectedTeamSlug &&
        fallback.primaryTeamCost > 0
      ) {
        primaryTeamCost = fallback.primaryTeamCost
      }

      players[player.id] = {
        selectedTeamSlug,
        additionalTeamSlugs: normalizeAdditionalSlugs(saved?.additionalTeamSlugs, selectedTeamSlug),
        cardsSpent:
          typeof saved?.cardsSpent === 'number' && saved.cardsSpent > 0 ? saved.cardsSpent : 0,
        primaryTeamCost,
      }
    }

    return { players }
  } catch {
    return migrateLegacyState(emptyState())
  }
}

function migrateLegacyState(state: GameState): GameState {
  try {
    const legacySelected = localStorage.getItem(LEGACY_KEYS.selectedTeam)
    const legacySpent = localStorage.getItem(LEGACY_KEYS.cardsSpent)
    const activePlayer = localStorage.getItem(ACTIVE_PLAYER_KEY) ?? GAME_PLAYERS[0]?.id

    if (legacySelected && activePlayer && state.players[activePlayer]) {
      state.players[activePlayer] = {
        selectedTeamSlug: legacySelected,
        additionalTeamSlugs: [],
        cardsSpent: legacySpent ? Number.parseInt(legacySpent, 10) || 0 : 0,
        primaryTeamCost: 0,
      }
    }

    for (const key of Object.values(LEGACY_KEYS)) {
      localStorage.removeItem(key)
    }
  } catch {
    // ignore migration errors
  }

  writeState(state)
  return state
}

function writeState(state: GameState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('waffstake-state-change'))
}

export function subscribeGameState(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STATE_KEY || event.key === ACTIVE_PLAYER_KEY) listener()
  }
  const onCustom = () => listener()

  window.addEventListener('storage', onStorage)
  window.addEventListener('waffstake-state-change', onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('waffstake-state-change', onCustom)
  }
}

export function getActivePlayerId(): string | null {
  try {
    const id = localStorage.getItem(ACTIVE_PLAYER_KEY)
    return id && GAME_PLAYERS.some((player) => player.id === id) ? id : null
  } catch {
    return null
  }
}

export function setActivePlayerId(playerId: string): void {
  if (!GAME_PLAYERS.some((player) => player.id === playerId)) return
  localStorage.setItem(ACTIVE_PLAYER_KEY, playerId)
  window.dispatchEvent(new CustomEvent('waffstake-state-change'))
}

export function clearActivePlayerId(): void {
  localStorage.removeItem(ACTIVE_PLAYER_KEY)
  window.dispatchEvent(new CustomEvent('waffstake-state-change'))
}

export function getPlayerState(playerId: string): PlayerState {
  const state = readState()
  return state.players[playerId] ?? { ...DEFAULT_PLAYER_STATE }
}

export function getActivePlayerState(): PlayerState | null {
  const playerId = getActivePlayerId()
  return playerId ? getPlayerState(playerId) : null
}

export function setSelectedTeamSlug(playerId: string, slug: string): void {
  if (isGameTime()) return

  const state = readState()
  const current = state.players[playerId] ?? { ...DEFAULT_PLAYER_STATE }
  const additionalTeamSlugs = current.additionalTeamSlugs.filter((teamSlug) => teamSlug !== slug)
  state.players[playerId] = {
    ...current,
    selectedTeamSlug: slug,
    additionalTeamSlugs,
    cardsSpent: 0,
    primaryTeamCost: primaryTeamCostForSlug(slug),
  }
  writeState(state)
  appendActivity({ playerId, type: 'picked', teamSlug: slug })
}

function findTeamSlot(
  playerState: PlayerState,
  teamSlug: string,
): 'primary' | 'additional' | null {
  if (playerState.selectedTeamSlug === teamSlug) return 'primary'
  if (playerState.additionalTeamSlugs.includes(teamSlug)) return 'additional'
  return null
}

function removeTeamFromPlayer(playerState: PlayerState, teamSlug: string): PlayerState {
  if (playerState.selectedTeamSlug === teamSlug) {
    const [promoted, ...rest] = playerState.additionalTeamSlugs
    return {
      ...playerState,
      selectedTeamSlug: promoted ?? null,
      additionalTeamSlugs: rest,
      cardsSpent: 0,
      primaryTeamCost: 0,
    }
  }

  return {
    ...playerState,
    additionalTeamSlugs: playerState.additionalTeamSlugs.filter((slug) => slug !== teamSlug),
  }
}

export function findTeamOwner(teamSlug: string, exceptPlayerId?: string): string | null {
  const state = readState()
  for (const player of GAME_PLAYERS) {
    if (player.id === exceptPlayerId) continue
    const playerState = state.players[player.id]
    if (playerState && playerOwnsTeam(playerState, teamSlug)) return player.id
  }
  return null
}

export function acquireTeam(
  buyerId: string,
  teamSlug: string,
  cost: number,
  defenderId: string | null,
): boolean {
  if (isGameTime()) return false

  const state = readState()
  const buyer = state.players[buyerId] ?? { ...DEFAULT_PLAYER_STATE }

  if (playerOwnsTeam(buyer, teamSlug)) return false

  const buyerFormerSlug = buyer.selectedTeamSlug
  if (!buyerFormerSlug) return false

  const buyerRow = buildLeaderboardRows().find((team) => team.slug === buyerFormerSlug)
  const availableYellows = Math.max(
    0,
    STARTING_POINTS + (buyerRow?.yellowCards ?? 0) - buyer.cardsSpent - buyer.primaryTeamCost,
  )

  if (availableYellows < cost) return false

  const addingToExtra = !defenderId && hasEmptyAdditionalSlot(buyer)

  if (defenderId) {
    const defender = state.players[defenderId] ?? { ...DEFAULT_PLAYER_STATE }
    const defenderSlot = findTeamSlot(defender, teamSlug)

    if (defenderSlot === 'primary' && buyerFormerSlug) {
      state.players[defenderId] = {
        ...defender,
        selectedTeamSlug: buyerFormerSlug,
        cardsSpent: 0,
        primaryTeamCost: buyer.primaryTeamCost,
      }
    } else if (defenderSlot === 'additional') {
      state.players[defenderId] = removeTeamFromPlayer(defender, teamSlug)
    }

    state.players[buyerId] = {
      selectedTeamSlug: teamSlug,
      additionalTeamSlugs: buyer.additionalTeamSlugs,
      cardsSpent: 0,
      primaryTeamCost: cost,
    }
  } else if (addingToExtra) {
    state.players[buyerId] = {
      ...buyer,
      additionalTeamSlugs: [...buyer.additionalTeamSlugs, teamSlug],
      cardsSpent: buyer.cardsSpent + cost,
    }
  } else {
    state.players[buyerId] = {
      selectedTeamSlug: teamSlug,
      additionalTeamSlugs: buyer.additionalTeamSlugs,
      cardsSpent: 0,
      primaryTeamCost: cost,
    }
  }

  writeState(state)

  if (defenderId) {
    appendActivity({
      playerId: buyerId,
      type: 'stole',
      teamSlug,
      cost,
      fromPlayerId: defenderId,
    })
  } else if (addingToExtra) {
    appendActivity({
      playerId: buyerId,
      type: 'added',
      teamSlug,
      cost,
    })
  } else {
    appendActivity({
      playerId: buyerId,
      type: 'swapped',
      teamSlug,
      cost,
    })
  }

  return true
}

export function getAllPlayerStates(): Record<string, PlayerState> {
  return readState().players
}

export function resetPlayerState(playerId: string): void {
  const player = getGamePlayer(playerId)
  if (!player?.isTestPlayer) return

  const state = readState()
  state.players[playerId] = defaultStateForPlayer(playerId)
  writeState(state)
}

export function resetAllGameState(): void {
  writeState(emptyState())
  clearActivityFeed()
  localStorage.setItem(GAME_DATA_VERSION_KEY, String(GAME_DATA_VERSION))
}
