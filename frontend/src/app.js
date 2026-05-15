/**
 * Lógica principal de la SPA PolySignal.
 *
 * Responsabilidades:
 *   - Routing de vistas (dashboard, positions, watchlist, alerts)
 *   - Sidebar y paneles colapsables
 *   - Carga inicial de datos y actualizaciones en tiempo real
 *   - Integración con api.js, map.js, charts.js, simulator.js
 */

import { io } from 'socket.io-client'
import * as api from './api.js'
import * as charts from './charts.js'
import * as map from './map.js'
import * as simulator from './simulator.js'

/* ─── Estado global ─── */
let state = {
  view: 'dashboard',
  activeMarketId: null,
  markets: [],
  signals: [],
  positions: [],
  watchlist: [],
  alerts: [],
  collapsedPanels: new Set(),
  sidebarCollapsed: false,
}

/* ─── Datos mock para demo (fallback si backend no responde) ─── */
const MOCK_MARKETS = [
  {
    id: 'usa-001',
    question: '¿Trump firmará la ley fiscal antes de junio de 2026?',
    category: 'política',
    countryCode: 'US',
    yesPrice: 0.73,
    noPrice: 0.27,
    volumeEur: 1240000,
    liquidityEur: 340000,
    status: 'active',
    closesAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'eur-001',
    question: '¿El BCE recortará tipos en junio de 2026?',
    category: 'economía',
    countryCode: 'DE',
    yesPrice: 0.34,
    noPrice: 0.66,
    volumeEur: 890000,
    liquidityEur: 210000,
    status: 'active',
    closesAt: '2026-06-12T00:00:00Z',
  },
  {
    id: 'chn-001',
    question: '¿Se alcanzará un acuerdo arancelario EE.UU.-China antes del T3 2026?',
    category: 'comercio',
    countryCode: 'CN',
    yesPrice: 0.51,
    noPrice: 0.49,
    volumeEur: 2100000,
    liquidityEur: 580000,
    status: 'active',
    closesAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'bra-001',
    question: '¿Bitcoin superará los $120.000 antes de julio de 2026?',
    category: 'cripto',
    countryCode: 'BR',
    yesPrice: 0.61,
    noPrice: 0.39,
    volumeEur: 3400000,
    liquidityEur: 920000,
    status: 'active',
    closesAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'uk-001',
    question: '¿La inflación del Reino Unido bajará del 2% en 2026?',
    category: 'economía',
    countryCode: 'GB',
    yesPrice: 0.45,
    noPrice: 0.55,
    volumeEur: 620000,
    liquidityEur: 180000,
    status: 'active',
    closesAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'ind-001',
    question: '¿El crecimiento del PIB de India superará el 7% en el AF2026?',
    category: 'economía',
    countryCode: 'IN',
    yesPrice: 0.68,
    noPrice: 0.32,
    volumeEur: 450000,
    liquidityEur: 120000,
    status: 'active',
    closesAt: '2026-03-31T00:00:00Z',
  },
]

const MOCK_SIGNALS = {
  'usa-001': {
    signal: 'bullish',
    confidence: 0.87,
    summary: 'El liderazgo republicano confirmó 3 de 4 votos de comité asegurados. El sentimiento de noticias de 8 fuentes es positivo (+0,72). La línea temporal del Congreso sugiere que la ventana de firma se abre del 28 al 31 de mayo.',
    keyRisk: 'El proceso de enmiendas en el Senado podría retrasar más allá del 1 de junio.',
  },
  'eur-001': {
    signal: 'bearish',
    confidence: 0.74,
    summary: 'La inflación de la zona euro sorprendió al alza al 2,4% en abril. Las recientes declaraciones de los miembros del consejo de gobierno del BCE señalan que es más probable una pausa.',
    keyRisk: 'La valoración del mercado de bonos implica solo un 22% de probabilidad de recorte en junio.',
  },
  'chn-001': {
    signal: 'neutral',
    confidence: 0.52,
    summary: 'Las negociaciones continúan pero no se ha acordado un marco formal. Los flujos comerciales muestran patrones tempranos de evasión arancelaria, sugiriendo que ambas partes ganan tiempo.',
    keyRisk: 'Demasiadas variables geopolíticas. Se monitorea la declaración del USTR como señal clave.',
  },
  'bra-001': {
    signal: 'bullish',
    confidence: 0.79,
    summary: 'BTC actualmente en $103.400. Las métricas on-chain muestran acumulación de grandes carteras. Entradas en ETF +$820M esta semana. El mercado de opciones implica 68% de probabilidad de $120K a finales de junio.',
    keyRisk: 'Las condiciones de liquidez macro podrían cambiar si la Fed mantiene una postura hawkish.',
  },
  'uk-001': {
    signal: 'neutral',
    confidence: 0.58,
    summary: 'Las previsiones del BoE sugieren una caída gradual pero los shocks externos de precios de energía siguen siendo una incógnita. La inflación de servicios se mantiene en el 5,2%.',
    keyRisk: 'Las interrupciones geopolíticas en la cadena de suministro podrían reavivar la inflación de bienes.',
  },
  'ind-001': {
    signal: 'bullish',
    confidence: 0.71,
    summary: 'Dato del T4 AF25 en 7,1% con expansión del PMI manufacturero. El impulso del gasto público en infraestructura probablemente sostenga el momentum en el S1 AF26.',
    keyRisk: 'El impacto de El Niño en la producción agrícola podría reducir 30-40 pb del dato principal.',
  },
}

const MOCK_POSITIONS = [
  {
    id: 1,
    marketId: 'usa-001',
    outcome: 'SÍ',
    amountEur: 100,
    entryPrice: 0.68,
    currentPrice: 0.73,
    pnl: 14.20,
    kellyFraction: 0.25,
    openedAt: '2026-05-10T14:30:00Z',
  },
  {
    id: 2,
    marketId: 'eur-001',
    outcome: 'NO',
    amountEur: 80,
    entryPrice: 0.62,
    currentPrice: 0.66,
    pnl: -3.80,
    kellyFraction: 0.18,
    openedAt: '2026-05-11T09:15:00Z',
  },
]

const MOCK_ALERTS = [
  {
    id: 1,
    marketId: 'usa-001',
    type: 'cambio_señal',
    message: 'La señal cambió a ALCISTA (87%) en ley fiscal de Trump',
    sentAt: '2026-05-14T08:23:00Z',
  },
  {
    id: 2,
    marketId: 'bra-001',
    type: 'umbral_precio',
    message: 'El mercado BTC $120K SÍ cruzó el umbral de 60¢',
    sentAt: '2026-05-14T07:45:00Z',
  },
]

/* ─── Helpers ─── */
function formatCurrency(n) {
  if (n >= 1e6) return '€' + (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return '€' + (n / 1e3).toFixed(1) + 'K'
  return '€' + n.toFixed(0)
}

function formatPrice(p) {
  return Math.round(p * 100) + '¢'
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
}

function signalColorClass(signal) {
  if (signal === 'bullish') return 'green'
  if (signal === 'bearish') return 'red'
  return 'amber'
}

function getSignalBadgeClass(signal) {
  if (signal === 'bullish') return 'sig-bull'
  if (signal === 'bearish') return 'sig-bear'
  return 'sig-neut'
}

function getSignalLabel(signal) {
  if (signal === 'bullish') return 'ALC'
  if (signal === 'bearish') return 'BAJ'
  return 'NEUT'
}

function translateSignal(signal) {
  if (signal === 'bullish') return 'alcista'
  if (signal === 'bearish') return 'bajista'
  return 'neutral'
}

/* ─── Routing de vistas ─── */
function switchView(viewName) {
  state.view = viewName
  document.querySelectorAll('.view').forEach((el) => el.classList.toggle('active', el.id === `view-${viewName}`))
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === viewName))
  if (viewName === 'positions') renderPositions()
  if (viewName === 'watchlist') renderWatchlist()
  if (viewName === 'alerts') renderAlerts()
}

/* ─── Sidebar toggle ─── */
function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed
  document.getElementById('app').classList.toggle('collapsed', state.sidebarCollapsed)
}

/* ─── Panel toggle ─── */
function togglePanel(panelId) {
  const panel = document.getElementById(`panel-${panelId}`)
  if (!panel) return
  const isCollapsed = panel.classList.toggle('collapsed')
  if (isCollapsed) state.collapsedPanels.add(panelId)
  else state.collapsedPanels.delete(panelId)
}

/* ─── Render signals list ─── */
function renderSignals() {
  const container = document.getElementById('signals-list')
  if (!container) return
  container.innerHTML = state.markets
    .map((m) => {
      const sig = state.signals.find((s) => s.marketId === m.id) || MOCK_SIGNALS[m.id] || { signal: 'neutral', confidence: 0.5 }
      const isActive = state.activeMarketId === m.id
      const cls = signalColorClass(sig.signal)
      const badgeClass = getSignalBadgeClass(sig.signal)
      return `
        <div class="market-card ${isActive ? 'active' : ''}" data-market="${m.id}">
          <div class="market-cat">${m.category || 'General'} · ${m.countryCode || 'GL'}</div>
          <div class="market-q">${m.question}</div>
          <div class="market-footer">
            <div class="prob-bar-wrap">
              <div class="prob-bar-bg">
                <div class="prob-bar-fill bg-${cls}" style="--prob-width:${Math.round(m.yesPrice * 100)}%"></div>
              </div>
            </div>
            <span class="prob-val text-${cls}">${formatPrice(m.yesPrice)}</span>
            <span class="signal-badge ${badgeClass}">${getSignalLabel(sig.signal)}</span>
          </div>
        </div>
      `
    })
    .join('')

  container.querySelectorAll('.market-card').forEach((card) => {
    card.addEventListener('click', () => selectMarket(card.dataset.market))
  })
}

/* ─── Render mini positions in sidebar ─── */
function renderMiniPositions() {
  const container = document.getElementById('mini-positions')
  if (!container) return
  if (state.positions.length === 0) {
    container.innerHTML = '<div class="empty-state empty-state-sm">Aún sin posiciones</div>'
    return
  }
  let netPnl = 0
  const items = state.positions
    .map((p) => {
      const m = state.markets.find((x) => x.id === p.marketId) || { question: p.marketId }
      netPnl += p.pnl
      const cls = p.pnl >= 0 ? 'green' : 'red'
      const sign = p.pnl >= 0 ? '+' : ''
      return `
        <div class="flex-between mb-6">
          <span class="text-sm text-neutral font-mono">${m.question.substring(0, 32)}${m.question.length > 32 ? '…' : ''} ${p.outcome}</span>
          <span class="text-base font-semibold text-${cls} font-mono">${sign}€${p.pnl.toFixed(2)}</span>
        </div>
      `
    })
    .join('')

  const netCls = netPnl >= 0 ? 'green' : 'red'
  const netSign = netPnl >= 0 ? '+' : ''
  container.innerHTML = `
    ${items}
    <div class="divider"></div>
    <div class="flex-between">
      <span class="text-sm text-neutral font-mono">G&amp;P Neto</span>
      <span class="text-lg font-bold text-${netCls} font-mono">${netSign}€${netPnl.toFixed(2)}</span>
    </div>
  `
}

/* ─── Render detail panel ─── */
function renderDetail() {
  const container = document.getElementById('detail-body')
  if (!container) return
  const m = state.markets.find((x) => x.id === state.activeMarketId)
  if (!m) {
    container.innerHTML = '<div class="empty-state">Selecciona un mercado para ver detalles</div>'
    return
  }

  const sig = state.signals.find((s) => s.marketId === m.id) || MOCK_SIGNALS[m.id] || { signal: 'neutral', confidence: 0.5, summary: 'Aún no hay análisis de IA disponible.', keyRisk: '' }
  const delta = ((m.yesPrice - 0.5) * 20).toFixed(1)
  const deltaCls = m.yesPrice > 0.5 ? 'green' : 'red'
  const deltaSign = m.yesPrice > 0.5 ? '+' : ''

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <div class="detail-tag">${m.countryCode || 'GL'} · ${m.category || 'General'} · Polymarket</div>
        <div class="detail-q">${m.question}</div>
        <div class="detail-meta">Vol: ${formatCurrency(m.volumeEur || 0)} · Liq: ${formatCurrency(m.liquidityEur || 0)} · Cierra: ${formatDate(m.closesAt)}</div>
      </div>
      <div class="detail-metrics">
        <div class="metric">
          <div class="metric-label">Cambio 24h</div>
          <div class="metric-value text-${deltaCls}">${deltaSign}${delta}%</div>
        </div>
        <div class="metric-sep"></div>
        <div class="metric">
          <div class="metric-label">Confianza</div>
          <div class="metric-value text-blue">${Math.round(sig.confidence * 100)}%</div>
        </div>
      </div>
    </div>

    <div class="outcomes-row">
      <div class="outcome-card yes">
        <div class="outcome-name">SÍ</div>
        <div class="outcome-price">${formatPrice(m.yesPrice)}</div>
        <div class="outcome-delta td-green">▲ ${(m.yesPrice * 0.05).toFixed(1)}¢</div>
        <div class="sparkline" id="spark-yes"></div>
      </div>
      <div class="outcome-card no">
        <div class="outcome-name">NO</div>
        <div class="outcome-price">${formatPrice(m.noPrice)}</div>
        <div class="outcome-delta td-red">▼ ${(m.noPrice * 0.05).toFixed(1)}¢</div>
        <div class="sparkline" id="spark-no"></div>
      </div>
      <div class="chart-container">
        <div class="chart-label">Historial de precios 7d</div>
        <canvas id="detail-chart"></canvas>
      </div>
    </div>

    <div class="ai-box">
      <div class="ai-icon">◈</div>
      <div class="flex-1">
        <div class="flex-row gap-8 mb-4 flex-wrap">
          <div class="ai-label">Análisis IA · HuggingFace Qwen3-8B</div>
          <span class="signal-badge ${getSignalBadgeClass(sig.signal)}">${translateSignal(sig.signal).toUpperCase()} · ${Math.round(sig.confidence * 100)}%</span>
          <span class="text-xs text-neutral font-mono ml-auto">actualizado hace 2m</span>
        </div>
        <div class="ai-text">${sig.summary}${sig.keyRisk ? ' <strong>Riesgo clave:</strong> ' + sig.keyRisk : ''}</div>
      </div>
    </div>

    <div class="sim-row">
      <span class="sim-label">Simular posición →</span>
      <input class="sim-input" type="number" id="sim-amount" value="100" min="1" placeholder="€"/>
      <button class="sim-btn-yes" id="sim-yes">COMPRAR SÍ ↗</button>
      <button class="sim-btn-no" id="sim-no">COMPRAR NO</button>
      <span class="sim-disclaimer">Simulado · sin trading real</span>
    </div>
  `

  // Bind simulator buttons
  document.getElementById('sim-yes')?.addEventListener('click', () => simulator.openPosition(m.id, 'SÍ', document.getElementById('sim-amount').value))
  document.getElementById('sim-no')?.addEventListener('click', () => simulator.openPosition(m.id, 'NO', document.getElementById('sim-amount').value))

  // Render chart
  charts.renderDetailChart('detail-chart', m.yesPrice)
  charts.renderSparkline('spark-yes', m.yesPrice, 'yes')
  charts.renderSparkline('spark-no', m.noPrice, 'no')
}

/* ─── Select market ─── */
function selectMarket(marketId) {
  state.activeMarketId = marketId
  renderSignals()
  renderDetail()
  map.highlightMarket(marketId)
}

/* ─── Render positions view ─── */
function renderPositions() {
  const tbody = document.querySelector('#positions-table tbody')
  const empty = document.getElementById('positions-empty')
  if (!tbody) return
  if (state.positions.length === 0) {
    tbody.innerHTML = ''
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  tbody.innerHTML = state.positions
    .map((p) => {
      const m = state.markets.find((x) => x.id === p.marketId) || { question: p.marketId }
      const pnlColor = p.pnl >= 0 ? 'td-green' : 'td-red'
      const sign = p.pnl >= 0 ? '+' : ''
      return `
        <tr>
          <td>${m.question.substring(0, 40)}${m.question.length > 40 ? '…' : ''}</td>
          <td class="td-mono ${p.outcome === 'SÍ' ? 'td-green' : 'td-red'}">${p.outcome}</td>
          <td class="td-mono">€${p.amountEur.toFixed(0)}</td>
          <td class="td-mono">${formatPrice(p.entryPrice)}</td>
          <td class="td-mono">${formatPrice(p.currentPrice)}</td>
          <td class="td-mono ${pnlColor}">${sign}€${p.pnl.toFixed(2)}</td>
          <td class="td-mono td-blue">${((p.kellyFraction || 0) * 100).toFixed(0)}%</td>
          <td class="td-mono">${formatDate(p.openedAt)}</td>
          <td><button class="btn-ghost" onclick="closePositionById(${p.id})">Cerrar</button></td>
        </tr>
      `
    })
    .join('')
}

window.closePositionById = async (id) => {
  await simulator.closePosition(id)
  await loadPositions()
  renderPositions()
  renderMiniPositions()
}

/* ─── Render watchlist view ─── */
function renderWatchlist() {
  const tbody = document.querySelector('#watchlist-table tbody')
  const empty = document.getElementById('watchlist-empty')
  if (!tbody) return
  if (state.watchlist.length === 0) {
    tbody.innerHTML = ''
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  tbody.innerHTML = state.watchlist
    .map((w) => {
      const m = state.markets.find((x) => x.id === w.marketId) || { question: w.marketId, category: '-', yesPrice: 0, noPrice: 0, volumeEur: 0 }
      const sig = state.signals.find((s) => s.marketId === w.marketId) || { signal: 'neutral' }
      return `
        <tr>
          <td>${m.question.substring(0, 40)}${m.question.length > 40 ? '…' : ''}</td>
          <td>${m.category || '-'}</td>
          <td class="td-mono td-green">${formatPrice(m.yesPrice)}</td>
          <td class="td-mono td-red">${formatPrice(m.noPrice)}</td>
          <td><span class="signal-badge ${getSignalBadgeClass(sig.signal)}">${getSignalLabel(sig.signal)}</span></td>
          <td class="td-mono">${formatCurrency(m.volumeEur || 0)}</td>
          <td class="td-mono">${w.alertThreshold ? formatPrice(w.alertThreshold) : '-'}</td>
          <td><button class="btn-ghost" onclick="removeFromWatchlistById('${w.marketId}')">Eliminar</button></td>
        </tr>
      `
    })
    .join('')
}

window.removeFromWatchlistById = async (marketId) => {
  try { await api.removeFromWatchlist(marketId) } catch (e) { console.warn(e) }
  state.watchlist = state.watchlist.filter((w) => w.marketId !== marketId)
  renderWatchlist()
}

/* ─── Render alerts view ─── */
function renderAlerts() {
  const tbody = document.querySelector('#alerts-table tbody')
  const empty = document.getElementById('alerts-empty')
  if (!tbody) return
  if (state.alerts.length === 0) {
    tbody.innerHTML = ''
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  tbody.innerHTML = state.alerts
    .map((a) => {
      const m = state.markets.find((x) => x.id === a.marketId) || { question: a.marketId }
      return `
        <tr>
          <td class="td-mono">${new Date(a.sentAt).toLocaleString('es-ES')}</td>
          <td>${m.question.substring(0, 35)}${m.question.length > 35 ? '…' : ''}</td>
          <td><span class="signal-badge sig-neut">${a.type}</span></td>
          <td>${a.message}</td>
        </tr>
      `
    })
    .join('')
}

/* ─── Carga de datos ─── */
async function loadMarkets() {
  try {
    const data = await api.getMarkets({ limit: 50 })
    state.markets = data.length ? data : MOCK_MARKETS
  } catch (e) {
    console.warn('API mercados no disponible, usando datos de prueba')
    state.markets = MOCK_MARKETS
  }
}

async function loadSignals() {
  try {
    const promises = state.markets.map((m) => api.getSignal(m.id).catch(() => null))
    const results = await Promise.all(promises)
    state.signals = results.filter(Boolean).map((r, i) => ({ ...r, marketId: state.markets[i].id }))
  } catch (e) {
    console.warn('API señales no disponible, usando datos de prueba')
    state.signals = Object.entries(MOCK_SIGNALS).map(([marketId, s]) => ({ ...s, marketId }))
  }
}

async function loadPositions() {
  try {
    state.positions = await api.getPositions()
  } catch (e) {
    state.positions = MOCK_POSITIONS
  }
}

async function loadWatchlist() {
  try {
    state.watchlist = await api.getWatchlist()
  } catch (e) {
    state.watchlist = []
  }
}

async function loadAlerts() {
  try {
    state.alerts = await api.getAlerts()
  } catch (e) {
    state.alerts = MOCK_ALERTS
  }
}

/* ─── Inicialización ─── */
export async function init() {
  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar)

  // Nav routing
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.addEventListener('click', () => switchView(el.dataset.view))
  })

  // Panel toggles
  document.querySelectorAll('.panel-header[data-panel]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Evitar colapsar al clicar elementos interactivos
      if (e.target.closest('button, input, a')) return
      togglePanel(el.dataset.panel)
    })
  })

  // Load initial data
  await loadMarkets()
  await loadSignals()
  await loadPositions()
  await loadWatchlist()
  await loadAlerts()

  // Init modules
  map.init('map-container', state.markets, state.signals, selectMarket)
  simulator.init(state)

  // Initial render
  state.activeMarketId = state.markets[0]?.id || null
  renderSignals()
  renderDetail()
  renderMiniPositions()

  // Socket.io
  const socket = io()
  socket.on('connect', () => console.log('Socket.io conectado'))

  socket.on('market_update', (data) => {
    const m = state.markets.find((x) => x.id === data.marketId)
    if (m) {
      Object.assign(m, data)
      if (state.activeMarketId === data.marketId) renderDetail()
      renderSignals()
      map.updateBubble(data.marketId, data.yesPrice)
    }
  })

  socket.on('ai_signal', (data) => {
    const idx = state.signals.findIndex((s) => s.marketId === data.marketId)
    if (idx >= 0) state.signals[idx] = data
    else state.signals.push(data)
    renderSignals()
    if (state.activeMarketId === data.marketId) renderDetail()
  })

  socket.on('price_alert', (data) => {
    state.alerts.unshift(data)
    if (state.view === 'alerts') renderAlerts()
  })

  // Stats animation mock
  setInterval(() => {
    const el = document.getElementById('stat-markets')
    if (el) {
      const n = parseInt(el.textContent.replace(/\./g, '')) + Math.floor(Math.random() * 3)
      el.textContent = n.toLocaleString('es-ES')
    }
    const el2 = document.getElementById('stat-signals')
    if (el2 && Math.random() > 0.7) {
      const n = parseInt(el2.textContent) + 1
      el2.textContent = n
    }
  }, 3000)
}
