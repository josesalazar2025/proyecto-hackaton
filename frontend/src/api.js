/**
 * Cliente HTTP para consumir la API REST del backend.
 *
 * Endpoints:
 *   - getMarkets(), getMarket(id), getSignal(id)
 *   - createPosition(data), getPositions(), closePosition(id)
 *   - addToWatchlist(marketId), removeFromWatchlist(marketId), getWatchlist()
 *   - getAlerts(), getStats()
 *
 * Base URL: /api/v1 (mismo dominio, sin CORS en producción HF Spaces).
 */

const BASE = '/api/v1'

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

/* ─── Markets ─── */
export async function getMarkets(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return fetchJson(`${BASE}/markets${qs ? '?' + qs : ''}`)
}

export async function getMarket(id) {
  return fetchJson(`${BASE}/markets/${id}`)
}

/* ─── Signals ─── */
export async function getSignal(marketId) {
  return fetchJson(`${BASE}/markets/${marketId}/signal`)
}

/* ─── Positions ─── */
export async function getPositions() {
  return fetchJson(`${BASE}/positions`)
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
