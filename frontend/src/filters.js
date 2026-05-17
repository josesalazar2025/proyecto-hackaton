/**
 * Utilidades de filtrado para el dashboard.
 *
 * Expone funciones para extraer opciones unicas de filtros desde mercados.
 */

// ── Extractores de opciones de filtro ─────────────────────────────────────────

export function extractFilterOptions(markets) {
  const categories = new Set()

  for (const m of markets) {
    if (m.category) categories.add(m.category)
  }

  return {
    categories: ['Todas', ...Array.from(categories).sort()],
  }
}

// ── Filtrado ──────────────────────────────────────────────────────────────────

export function filterMarkets(markets, { category }) {
  return markets.filter((m) => {
    if (category && category !== 'Todas' && m.category !== category) return false
    return true
  })
}
