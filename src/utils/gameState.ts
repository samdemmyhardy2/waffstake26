import { GAME_PLAYERS, getGamePlayer } from '../data/gamePlayers'
import { TEAM_SEED_BY_SLUG, cardsRequiredForSeed } from '../data/teamSeeds'
import { appendActivity, clearActivityFeed } from './activityFeed'
import { buildLeaderboardRows } from './leaderboard'
import { isGameTime } from './gameTime'
import { isGameSyncEnabled, scheduleSyncPush } from './gameSync'
import { buildShopTeams } from './shopTeams'

export const MAX_ADDITIONAL_TEAMS = 2
export const STARTING_POINTS = 12

export interface PlayerState {
  startingTeamSlug: string | null
  selectedTeamSlug: string | null
  additionalTeamSlugs: string[]
  cardsSpent: number
  teamCost: number
}

interface GameState {
  players: Record<string, PlayerState>
}

const STATE_KEY = 'waffstake-game-state'
const ACTIVE_PLAYER_KEY = 'waffstake-active-player'
const GAME_DATA_VERSION_KEY = 'waffstake-data-version'
const GAME_DATA_VERSION = 2

const LEGACY_KEYS = {
  selectedTeam: 'waffstake-selected-team',
  cardsSpent: 'waffstake-cards-spent',
  ownedTeams: 'waffstake-owned-teams',
  ownedTeam: 'waffstake-owned-team',
} as const

const DEFAULT_PLAYER_STATE: PlayerState = {
  startingTeamSlug: null,
  selectedTeamSlug: null,
  additionalTeamSlugs: [],
  cardsSpent: 0,
  teamCost: 0,
}

function teamCostForSlug(slug: string): number {
  const seed = TEAM_SEED_BY_SLUG[slug] ?? 48
  return cardsRequiredForSeed(seed)
}

function additionalTeamsCost(state: PlayerState): number {
  const shopTeams = buildShopTeams()
  return state.additionalTeamSlugs.reduce((total, slug) => {
    const team = shopTeams.find((entry) => entry.slug === slug)
    return total + (team?.cardsRequired ?? 0)
  }, 0)
}

function normalizeAdditionalSlugs(slugs: unknown, mainSlug: string | null): string[] {
  if (!Array.isArray(slugs)) return []

  const seen = new Set<string>()
  const normalized: string[] = []

  for (const slug of slugs) {
    if (typeof slug !== 'string' || slug === mainSlug || seen.has(slug)) continue
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

function totalYellowCardsForPlayer(state: PlayerState): number {
  const rows = buildLeaderboardRows()
  return getPlayerTeamSlugs(state).reduce((total, slug) => {
    const team = rows.find((entry) => entry.slug === slug)
    return total + (team?.yellowCards ?? 0)
  }, 0)
}

export function getSquadYellowCards(state: PlayerState): number {
  return totalYellowCardsForPlayer(state)
}

export function getRemainingStartingPoints(state: PlayerState): number {
  return Math.max(0, STARTING_POINTS - state.teamCost - additionalTeamsCost(state))
}

export function getAvailableCardsForPlayer(state: PlayerState): number {
  if (!state.selectedTeamSlug) return 0

  return Math.max(
    0,
    STARTING_POINTS +
      totalYellowCardsForPlayer(state) -
      state.teamCost -
      additionalTeamsCost(state),
  )
}

function isUpgradePurchase(state: PlayerState, cost: number, isSteal: boolean): boolean {
  if (isSteal) return true

  const remaining = getRemainingStartingPoints(state)
  if (!isSteal && remaining >= cost && hasEmptyAdditionalSlot(state)) {
    return false
  }

  if (!hasEmptyAdditionalSlot(state)) return true
  if (!state.selectedTeamSlug) return true
  return cost > teamCostForSlug(state.selectedTeamSlug)
}

type UpgradePlan =
  | { type: 'replace-main'; keepAdditional: string[] }
  | { type: 'fill-additional'; forfeitSlug: string; keepAdditional: string[] }
  | { type: 'replace-all' }

function planUpgradePurchase(state: PlayerState, cost: number, isSteal: boolean): UpgradePlan {
  const remaining = getRemainingStartingPoints(state)
  const rows = buildLeaderboardRows()
  const main = rows.find((team) => team.slug === state.selectedTeamSlug)
  const mainYellows = main?.yellowCards ?? 0

  if (remaining < cost && remaining + mainYellows >= cost) {
    return { type: 'replace-main', keepAdditional: [...state.additionalTeamSlugs] }
  }

  if (!isSteal && remaining >= cost && !hasEmptyAdditionalSlot(state)) {
    return { type: 'replace-main', keepAdditional: [...state.additionalTeamSlugs] }
  }

  if (!isSteal) {
    for (const slug of state.additionalTeamSlugs) {
      const team = rows.find((entry) => entry.slug === slug)
      if (team && team.yellowCards >= cost) {
        return {
          type: 'fill-additional',
          forfeitSlug: slug,
          keepAdditional: state.additionalTeamSlugs.filter((entry) => entry !== slug),
        }
      }
    }
  }

  return { type: 'replace-all' }
}

export type PurchasePlan = UpgradePlan | { type: 'add' }

export function previewPurchase(
  state: PlayerState,
  cost: number,
  isSteal: boolean,
): PurchasePlan {
  if (!isSteal && !isUpgradePurchase(state, cost, false)) {
    return { type: 'add' }
  }
  return planUpgradePurchase(state, cost, isSteal)
}

export function willForfeitAllTeamsOnUpgrade(
  state: PlayerState,
  cost: number,
  isSteal: boolean,
): boolean {
  return planUpgradePurchase(state, cost, isSteal).type === 'replace-all'
}

export function formatPurchaseMessage(
  plan: PurchasePlan,
  teamName: string,
  cost: number,
): string {
  if (plan.type === 'add') {
    return `You added ${teamName} for ${cost} cards.`
  }

  switch (plan.type) {
    case 'replace-all':
      return `You bought ${teamName} for ${cost} cards — all your teams went back to the shop.`
    case 'replace-main':
      return plan.keepAdditional.length > 0
        ? `You bought ${teamName} for ${cost} cards — your top team went back to the shop.`
        : `You bought ${teamName} for ${cost} cards — your old team went back to the shop.`
    case 'fill-additional':
      return `You bought ${teamName} for ${cost} cards — one of your extra teams went back to the shop.`
  }
}

function applyUpgradePlan(
  buyer: PlayerState,
  teamSlug: string,
  cost: number,
  plan: UpgradePlan,
): PlayerState {
  switch (plan.type) {
    case 'replace-main':
      return {
        ...buyer,
        startingTeamSlug: teamSlug,
        selectedTeamSlug: teamSlug,
        additionalTeamSlugs: plan.keepAdditional,
        cardsSpent: 0,
        teamCost: cost,
      }
    case 'fill-additional':
      return {
        ...buyer,
        additionalTeamSlugs: [
          ...plan.keepAdditional,
          teamSlug,
        ],
        cardsSpent: 0,
      }
    case 'replace-all':
      return {
        startingTeamSlug: teamSlug,
        selectedTeamSlug: teamSlug,
        additionalTeamSlugs: [],
        cardsSpent: 0,
        teamCost: cost,
      }
  }
}

function defaultStateForPlayer(playerId: string): PlayerState {
  const player = getGamePlayer(playerId)
  const slug = player?.defaultTeamSlug ?? null
  const teamCost = slug ? teamCostForSlug(slug) : 0

  return {
    startingTeamSlug: slug,
    selectedTeamSlug: slug,
    additionalTeamSlugs: [],
    cardsSpent: 0,
    teamCost,
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
    const stored = localStorage.getItem(GAME_DATA_VERSION_KEY)
    if (stored === String(GAME_DATA_VERSION)) return

    if (!stored) {
      localStorage.setItem(GAME_DATA_VERSION_KEY, String(GAME_DATA_VERSION))
      if (!isGameSyncEnabled()) {
        writeState(emptyState())
        clearActivityFeed()
      }
      return
    }

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
      const saved = parsed.players[player.id] as
        | (Partial<PlayerState> & { primaryTeamCost?: number })
        | undefined
      const fallback = defaultStateForPlayer(player.id)
      const selectedTeamSlug =
        typeof saved?.selectedTeamSlug === 'string'
          ? saved.selectedTeamSlug
          : fallback.selectedTeamSlug

      const startingTeamSlug =
        typeof saved?.startingTeamSlug === 'string'
          ? saved.startingTeamSlug
          : fallback.startingTeamSlug ?? selectedTeamSlug

      let teamCost =
        typeof saved?.teamCost === 'number'
          ? saved.teamCost
          : typeof saved?.primaryTeamCost === 'number'
            ? saved.primaryTeamCost
            : fallback.teamCost

      if (
        teamCost === 0 &&
        selectedTeamSlug === fallback.selectedTeamSlug &&
        fallback.teamCost > 0
      ) {
        teamCost = fallback.teamCost
      }

      players[player.id] = {
        startingTeamSlug,
        selectedTeamSlug,
        additionalTeamSlugs: normalizeAdditionalSlugs(saved?.additionalTeamSlugs, selectedTeamSlug),
        cardsSpent:
          typeof saved?.cardsSpent === 'number' && saved.cardsSpent > 0 ? saved.cardsSpent : 0,
        teamCost,
      }
    }

    return { players }
  } catch {
    return migrateLegacyState(emptyState())
  }
}

function migrateLegacyState(state: GameState): GameState {
  let didMigrate = false

  try {
    const legacySelected = localStorage.getItem(LEGACY_KEYS.selectedTeam)
    const legacySpent = localStorage.getItem(LEGACY_KEYS.cardsSpent)
    const activePlayer = localStorage.getItem(ACTIVE_PLAYER_KEY) ?? GAME_PLAYERS[0]?.id

    if (legacySelected && activePlayer && state.players[activePlayer]) {
      didMigrate = true
      state.players[activePlayer] = {
        startingTeamSlug: legacySelected,
        selectedTeamSlug: legacySelected,
        additionalTeamSlugs: [],
        cardsSpent: legacySpent ? Number.parseInt(legacySpent, 10) || 0 : 0,
        teamCost: 0,
      }
    }

    for (const key of Object.values(LEGACY_KEYS)) {
      localStorage.removeItem(key)
    }
  } catch {
    // ignore migration errors
  }

  if (didMigrate || !isGameSyncEnabled()) {
    writeState(state)
  }

  return state
}

function writeState(state: GameState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('waffstake-state-change'))
  scheduleSyncPush()
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
  state.players[playerId] = {
    startingTeamSlug: slug,
    selectedTeamSlug: slug,
    additionalTeamSlugs: [],
    cardsSpent: 0,
    teamCost: teamCostForSlug(slug),
  }
  writeState(state)
  appendActivity({ playerId, type: 'picked', teamSlug: slug })
}

function findTeamSlot(
  playerState: PlayerState,
  teamSlug: string,
): 'main' | 'additional' | null {
  if (playerState.selectedTeamSlug === teamSlug) return 'main'
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
      teamCost: promoted ? teamCostForSlug(promoted) : 0,
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

  if (getAvailableCardsForPlayer(buyer) < cost) return false

  const isSteal = Boolean(defenderId)
  const upgrade = isUpgradePurchase(buyer, cost, isSteal)

  if (defenderId) {
    const defender = state.players[defenderId] ?? { ...DEFAULT_PLAYER_STATE }
    const defenderSlot = findTeamSlot(defender, teamSlug)
    const plan = planUpgradePurchase(buyer, cost, true)

    if (defenderSlot === 'main' && buyerFormerSlug) {
      state.players[defenderId] = {
        ...defender,
        selectedTeamSlug: buyerFormerSlug,
        cardsSpent: 0,
        teamCost: buyer.teamCost,
      }
    } else if (defenderSlot === 'additional') {
      state.players[defenderId] = removeTeamFromPlayer(defender, teamSlug)
    }

    state.players[buyerId] = applyUpgradePlan(buyer, teamSlug, cost, plan)
  } else if (upgrade) {
    const plan = planUpgradePurchase(buyer, cost, false)
    state.players[buyerId] = applyUpgradePlan(buyer, teamSlug, cost, plan)
  } else {
    state.players[buyerId] = {
      ...buyer,
      additionalTeamSlugs: [...buyer.additionalTeamSlugs, teamSlug],
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
  } else if (upgrade) {
    appendActivity({
      playerId: buyerId,
      type: 'swapped',
      teamSlug,
      cost,
    })
  } else {
    appendActivity({
      playerId: buyerId,
      type: 'added',
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
