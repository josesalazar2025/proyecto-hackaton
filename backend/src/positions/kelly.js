/**
 * Kelly criterion capped at 25%.
 * k = (odds * pWin - pLose) / odds
 * odds = (1 / price) - 1
 */
export function kellyFraction(price, pWin) {
  if (!price || price <= 0 || price >= 1 || !pWin) return 0;
  const pLose = 1 - pWin;
  const odds = 1 / price - 1;
  const k = (odds * pWin - pLose) / odds;
  return Math.min(Math.max(k, 0), 0.25);
}
