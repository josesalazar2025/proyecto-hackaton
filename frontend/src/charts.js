/**
 * Modulo de visualizacion de graficos usando Chart.js.
 *
 * Responsabilidades:
 *   - renderDetailChart(canvasId, currentPrice) → grafico de linea 7d con sparklines.
 *   - renderSparkline(containerId, price, side) → barras verticales animadas (YES/NO).
 *
 * Datos:
 *   - Los puntos se generan sinteticamente con ruido aleatorio alrededor del precio actual.
 *   - Color verde si precio > 50¢, rojo si < 40¢, naranja en medio.
 *
 * Consumido por:
 *   - app.js → al renderizar el panel de detalle de un mercado.
 */

import { Chart } from 'chart.js/auto'

let detailChartInstance = null

export function renderDetailChart(canvasId, currentPrice) {
  const ctx = document.getElementById(canvasId)
  if (!ctx) return
  if (detailChartInstance) detailChartInstance.destroy()

  const base = currentPrice * 100
  const pts = Array.from({ length: 8 }, (_, i) => {
    const noise = (Math.random() - 0.5) * 8
    return Math.max(5, Math.min(95, base - 12 + (i / 7) * 12 + noise))
  })
  pts[pts.length - 1] = base

  const col = base > 50 ? '#22d37a' : base < 40 ? '#f04040' : '#f0a020'

  detailChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['7d', '6d', '5d', '4d', '3d', '2d', '1d', 'now'],
      datasets: [
        {
          data: pts,
          borderColor: col,
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: { duration: 600 },
    },
  })
}

export function renderSparkline(containerId, price, side) {
  const el = document.getElementById(containerId)
  if (!el) return
  el.innerHTML = ''
  el.className = 'sparkline'

  const base = price * 100
  for (let i = 0; i < 12; i++) {
    const h = Math.max(4, Math.min(24, base / 4 + (Math.random() - 0.5) * 8))
    const d = document.createElement('div')
    d.className = 'spark-bar'
    d.style.height = h + 'px'
    d.style.background = side === 'yes' ? '#0d6e3a' : '#7a1a1a'
    el.appendChild(d)
  }
  const last = document.createElement('div')
  last.className = 'spark-bar'
  last.style.height = Math.min(28, base / 3.5) + 'px'
  last.style.background = side === 'yes' ? '#22d37a' : '#f04040'
  el.appendChild(last)
}
