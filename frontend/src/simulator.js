/**
 * Módulo del simulador de posiciones virtuales.
 *
 * Funciones:
 *   - init(state)
 *   - openPosition(marketId, outcome, amount)
 *   - closePosition(positionId)
 */

import * as api from './api.js'

let appState = null

export function init(state) {
  appState = state
}

export async function openPosition(marketId, outcome, amount) {
  const amt = parseFloat(amount)
  if (!amt || amt <= 0) {
    alert('Introduce una cantidad válida')
    return
  }

  const m = appState.markets.find((x) => x.id === marketId)
  if (!m) return

  const entryPrice = outcome === 'YES' ? m.yesPrice : m.noPrice
  const data = {
    marketId,
    outcome,
    amountEur: amt,
    entryPrice,
  }

  try {
    const created = await api.createPosition(data)
    appState.positions.push(created)
  } catch (e) {
    // Fallback: create locally if API unavailable
    const fakeId = Date.now()
    appState.positions.push({
      id: fakeId,
      marketId,
      outcome,
      amountEur: amt,
      entryPrice,
      currentPrice: entryPrice,
      pnl: 0,
      kellyFraction: 0.2,
      openedAt: new Date().toISOString(),
    })
  }

  // Trigger re-render via app.js if needed
  document.dispatchEvent(new CustomEvent('positions:changed'))
}

export async function closePosition(positionId) {
  try {
    await api.closePosition(positionId)
  } catch (e) {
    console.warn('API closePosition failed, removing locally')
  }
  appState.positions = appState.positions.filter((p) => p.id !== positionId)
  document.dispatchEvent(new CustomEvent('positions:changed'))
}
