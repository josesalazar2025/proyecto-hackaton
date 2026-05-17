/**
 * Cliente HTTP para consumir la API REST del backend.
 *
 * Responsabilidades:
 *   - Realizar peticiones fetch a /api/v1/* con headers JSON.
 *   - Gestionar token JWT (login, logout, Authorization header).
 *   - Extraer el campo `data` de las respuestas estandarizadas del backend.
 *   - Gestionar errores HTTP (lanza Error con status y body).
 *   - Manejar 204 No Content (retorna null).
 *
 * Modulos cubiertos:
 *   - Auth       → login(email, password), logout()
 *   - Markets    → getMarkets(params), getMarket(id)
 *   - Signals    → getSignal(marketId)
 *   - Positions  → getPositions(), createPosition(data), closePosition(id)
 *   - Watchlist  → getWatchlist(), addToWatchlist(...), removeFromWatchlist(...)
 *   - Alerts     → getAlerts()
 *   - Stats      → getStats()
 *
 * Base URL: /api/v1 (mismo dominio en produccion, proxy de Vite en desarrollo).
 */

const BASE = '/api/v1'
const TOKEN_KEY = 'polysignal_token'

/* ─── Token helpers ─── */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}

/* ─── Auth ─── */
export async function login(email, password) {
  const body = await fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
  if (body.token) {
    setToken(body.token)
  }
  return body
}

export async function register(email, password) {
  const body = await fetchJson(`${BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
  if (body.token) {
    setToken(body.token)
  }
  return body
}

export function logout() {
  clearToken()
}

export async function getMe() {
  return fetchJson(`${BASE}/auth/me`)
}

/* ─── Core fetch ─── */
async function fetchJson(url, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers }

  if (!opts.skipAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const res = await fetch(url, {
    headers,
    ...opts,
  })

  if (!res.ok) {
    if (res.status === 401) clearToken()
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  if (res.status === 204) return null

  const body = await res.json()
  // El backend envuelve respuestas exitosas en { ok: true, data: ... }
  if (body && body.ok === true && 'data' in body) {
    return body.data
  }
  return body
}

/* ─── Markets ─── */
export async function getMarkets(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return fetchJson(`${BASE}/markets${qs ? '?' + qs : ''}`)
}

export async function getMarket(id) {
  return fetchJson(`${BASE}/markets/${id}`)
}

export async function getMarketHistory(id, interval = '1w') {
  return fetchJson(`${BASE}/markets/${id}/history?interval=${interval}`)
}

/* ─── Signals ─── */
export async function getSignal(marketId) {
  return fetchJson(`${BASE}/markets/${marketId}/signal`)
}

export async function getSignalsBatch(marketIds) {
  if (!marketIds || marketIds.length === 0) return []
  const qs = new URLSearchParams({ marketIds: marketIds.join(',') }).toString()
  return fetchJson(`${BASE}/markets/signals/latest?${qs}`)
}

/* ─── Positions ─── */
export async function getPositions() {
  return fetchJson(`${BASE}/positions`)
}

export async function getPositionSuggestion(marketId, bankroll = 1000) {
  return fetchJson(`${BASE}/positions/suggestion/${marketId}?bankroll=${bankroll}`)
}

export async function createPosition(data) {
  return fetchJson(`${BASE}/positions`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function closePosition(id) {
  return fetchJson(`${BASE}/positions/${id}`, { method: 'DELETE' })
}

/* ─── Watchlist ─── */
export async function getWatchlist() {
  return fetchJson(`${BASE}/watchlist`)
}

export async function addToWatchlist(marketId, alertThreshold) {
  return fetchJson(`${BASE}/watchlist`, {
    method: 'POST',
    body: JSON.stringify({ marketId, alertThreshold }),
  })
}

export async function removeFromWatchlist(marketId) {
  return fetchJson(`${BASE}/watchlist/${marketId}`, { method: 'DELETE' })
}

/* ─── Alerts ─── */
export async function getAlerts() {
  return fetchJson(`${BASE}/alerts`)
}

/* ─── Stats ─── */
export async function getStats() {
  return fetchJson(`${BASE}/stats`)
}
