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
 */
export function kellyFraction(price, pWin) {
  if (!price || price <= 0 || price >= 1 || !pWin) return 0;
  const pLose = 1 - pWin;
  const odds = 1 / price - 1;
  const k = (odds * pWin - pLose) / odds;
  return Math.min(Math.max(k, 0), 0.25);
}

const SPREAD_ILLIQUID_THRESHOLD = 0.05;   // 5c bid/ask → mercado ilíquido
const KELLY_CONSERVATIVE_FACTOR = 0.25;   // Quarter-Kelly por seguridad (LLM no calibrada)
const MAX_BANKROLL_FRACTION = 0.25;       // No mas del 25% del bankroll por mercado

/**
 * Calcula una sugerencia de tamano de posicion *aware* del spread bid/ask.
 *
 * Resta el coste de ejecucion (spread) al edge bruto que reporta la IA. Si el
 * edge neto es <= 0, devuelve 0 (no recomienda apostar). Marca ilíquidos los
 * mercados con spread > 5c para que el frontend pueda deshabilitar el boton.
 *
 * @param {Object} args
 * @param {number} args.yesPrice   precio YES actual (0-1)
 * @param {number} args.noPrice    precio NO actual (0-1)
 * @param {number} args.spread     bid/ask spread (0-1) reportado por Polymarket
 * @param {Object} args.signal     { signal, confidence, edgePoints, fairProb }
 * @param {number} [args.bankroll=1000] capital virtual base (€)
 * @returns {{ outcome:'YES'|'NO'|null, fraction:number, amountEur:number,
 *            edgeNet:number, illiquid:boolean, note:string }}
 */
export function suggestSize({ yesPrice, noPrice, spread = 0, signal, bankroll = 1000 }) {
  const illiquid = (spread ?? 0) > SPREAD_ILLIQUID_THRESHOLD;

  if (!signal || signal.edgePoints == null) {
    return {
      outcome: null,
      fraction: 0,
      amountEur: 0,
      edgeNet: 0,
      illiquid,
      note: illiquid
        ? `Mercado ilíquido (spread ${Math.round((spread ?? 0) * 100)}¢). Compra desaconsejada.`
        : 'Sin señal IA disponible. No se puede calcular sugerencia.',
    };
  }

  const rawEdge = Math.abs(signal.edgePoints) / 100;     // 0-1 (probabilidad)
  const netEdge = rawEdge - (spread ?? 0);
  const outcome = signal.edgePoints > 0 ? 'YES' : 'NO';
  const price = outcome === 'YES' ? yesPrice : noPrice;

  if (netEdge <= 0.005 || !price || price <= 0 || price >= 1) {
    return {
      outcome: null,
      fraction: 0,
      amountEur: 0,
      edgeNet: netEdge,
      illiquid,
      note: illiquid
        ? `Mercado ilíquido (spread ${Math.round((spread ?? 0) * 100)}¢).`
        : `Sin edge neto tras spread (${(rawEdge * 100).toFixed(1)}pp − ${((spread ?? 0) * 100).toFixed(1)}pp). No apostar.`,
    };
  }

  // Probabilidad efectiva = implied + edgeNet, capada en [0,1)
  const pWin = Math.max(0, Math.min(0.99, price + netEdge));
  // Quarter-Kelly por seguridad: la confianza del LLM no esta calibrada.
  const k = kellyFraction(price, pWin) * KELLY_CONSERVATIVE_FACTOR;
  const fraction = Math.min(MAX_BANKROLL_FRACTION, Math.max(0, k));
  const amountEur = Math.round(bankroll * fraction);

  return {
    outcome,
    fraction,
    amountEur,
    edgeNet: netEdge,
    illiquid,
    note: illiquid
      ? `Mercado ilíquido (spread ${Math.round((spread ?? 0) * 100)}¢). Compra desaconsejada.`
      : `Kelly conservador (¼) sobre edge neto ${(netEdge * 100).toFixed(1)}pp: €${amountEur} en ${outcome}.`,
  };
}
