/**
 * Modulo del simulador de posiciones virtuales.
 *
 * Responsabilidades:
 *   - init(state)              → recibe referencia al estado global de app.js.
 *   - openPosition(...)        → crea posicion via API POST /positions.
 *   - closePosition(id)        → cierra posicion via API DELETE /positions/:id.
 *
 * Flujo openPosition:
 *   1. Valida cantidad > 0.
 *   2. Obtiene precio de entrada del mercado actual.
 *   3. POST /api/v1/positions → si 2xx, actualiza estado.
 *   4. Si API falla → muestra error al usuario.
 *
 * Eventos:
 *   - Emite CustomEvent 'positions:changed' para que app.js re-renderice.
 *
 * Consumido por:
 *   - app.js → botones "COMPRAR SI/NO" en el panel de detalle.
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
    document.dispatchEvent(new CustomEvent('positions:changed'))
  } catch (e) {
    console.error('Error abriendo posicion:', e)
    alert('No se pudo abrir la posición. ¿Has iniciado sesión?')
  }
}

export async function closePosition(positionId) {
  try {
    await api.closePosition(positionId)
    appState.positions = appState.positions.filter((p) => p.id !== positionId)
    document.dispatchEvent(new CustomEvent('positions:changed'))
  } catch (e) {
    console.error('Error cerrando posicion:', e)
    alert('No se pudo cerrar la posición')
  }
}
