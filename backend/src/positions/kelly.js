/**
 * Criterio de Kelly para sizing de posiciones, limitado al 25%.
 *
 * Formula:
 *   odds = (1 / price) - 1
 *   k = (odds * pWin - pLose) / odds
 *   return min(max(k, 0), 0.25)
 *
 * Parametros:
 *   - price : precio actual del outcome (0 < price < 1).
 *   - pWin  : probabilidad de ganar (usamos confidence de la senal IA).
 *
 * Devuelve:
 *   Fraccion del capital virtual recomendada (0.0 a 0.25).
 *
 * Consumido por:
 *   - positions.service.js → al abrir una posicion.
 */
export function kellyFraction(price, pWin) {
  if (!price || price <= 0 || price >= 1 || !pWin) return 0;
  const pLose = 1 - pWin;
  const odds = 1 / price - 1;
  const k = (odds * pWin - pLose) / odds;
  return Math.min(Math.max(k, 0), 0.25);
}
