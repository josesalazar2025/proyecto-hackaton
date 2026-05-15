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

// Creates an element with an optional class and optional text content
function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function emptyState(text, sm = false) {
  return el('div', sm ? 'empty-state empty-state-sm' : 'empty-state', text)
}

/* ─── Routing de vistas ─── */
function switchView(viewName) {
  state.view = viewName
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${viewName}`))
  document.querySelectorAll('.nav-item').forEach((v) => v.classList.toggle('active', v.dataset.view === viewName))
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
  container.replaceChildren()

  state.markets.forEach((m) => {
    const sig = state.signals.find((s) => s.marketId === m.id) || MOCK_SIGNALS[m.id] || { signal: 'neutral', confidence: 0.5 }
    const cls = signalColorClass(sig.signal)

    const card = el('div', `market-card${state.activeMarketId === m.id ? ' active' : ''}`)
    card.dataset.market = m.id

    const cat = el('div', 'market-cat')
    cat.textContent = `${m.category || 'General'} · ${m.countryCode || 'GL'}`

    const q = el('div', 'market-q')
    q.textContent = m.question

    const footer = el('div', 'market-footer')

    const probWrap = el('div', 'prob-bar-wrap')
    const probBg = el('div', 'prob-bar-bg')
    const probFill = el('div', `prob-bar-fill bg-${cls}`)
    probFill.style.setProperty('--prob-width', `${Math.round(m.yesPrice * 100)}%`)
    probBg.appendChild(probFill)
    probWrap.appendChild(probBg)

    const probVal = el('span', `prob-val text-${cls}`)
    probVal.textContent = formatPrice(m.yesPrice)

    const badge = el('span', `signal-badge ${getSignalBadgeClass(sig.signal)}`)
    badge.textContent = getSignalLabel(sig.signal)

    footer.append(probWrap, probVal, badge)
    card.append(cat, q, footer)
    card.addEventListener('click', () => selectMarket(card.dataset.market))
    container.appendChild(card)
  })
}

/* ─── Render mini positions in sidebar ─── */
function renderMiniPositions() {
  const container = document.getElementById('mini-positions')
  if (!container) return
  if (state.positions.length === 0) {
    container.replaceChildren(emptyState('Aún sin posiciones', true))
    return
  }
  container.replaceChildren()

  let netPnl = 0
  state.positions.forEach((p) => {
    const m = state.markets.find((x) => x.id === p.marketId) || { question: p.marketId }
    netPnl += p.pnl
    const cls = p.pnl >= 0 ? 'green' : 'red'
    const sign = p.pnl >= 0 ? '+' : ''

    const row = el('div', 'flex-between mb-6')
    const label = el('span', 'text-sm text-neutral font-mono')
    label.textContent = `${m.question.substring(0, 32)}${m.question.length > 32 ? '…' : ''} ${p.outcome}`
    const val = el('span', `text-base font-semibold text-${cls} font-mono`)
    val.textContent = `${sign}€${p.pnl.toFixed(2)}`
    row.append(label, val)
    container.appendChild(row)
  })

  const netCls = netPnl >= 0 ? 'green' : 'red'
  const netSign = netPnl >= 0 ? '+' : ''
  const netRow = el('div', 'flex-between')
  const netLabel = el('span', 'text-sm text-neutral font-mono', 'G&P Neto')
  const netVal = el('span', `text-lg font-bold text-${netCls} font-mono`)
  netVal.textContent = `${netSign}€${netPnl.toFixed(2)}`
  netRow.append(netLabel, netVal)
  container.append(el('div', 'divider'), netRow)
}

/* ─── Render detail panel ─── */
function renderDetail() {
  const container = document.getElementById('detail-body')
  if (!container) return
  const m = state.markets.find((x) => x.id === state.activeMarketId)
  if (!m) {
    container.replaceChildren(emptyState('Selecciona un mercado para ver detalles'))
    return
  }

  const sig = state.signals.find((s) => s.marketId === m.id) || MOCK_SIGNALS[m.id] || { signal: 'neutral', confidence: 0.5, summary: 'Aún no hay análisis de IA disponible.', keyRisk: '' }
  const delta = ((m.yesPrice - 0.5) * 20).toFixed(1)
  const deltaCls = m.yesPrice > 0.5 ? 'green' : 'red'
  const deltaSign = m.yesPrice > 0.5 ? '+' : ''

  // ── Header ──
  const tag = el('div', 'detail-tag')
  tag.textContent = `${m.countryCode || 'GL'} · ${m.category || 'General'} · Polymarket`
  const q = el('div', 'detail-q')
  q.textContent = m.question
  const meta = el('div', 'detail-meta')
  meta.textContent = `Vol: ${formatCurrency(m.volumeEur || 0)} · Liq: ${formatCurrency(m.liquidityEur || 0)} · Cierra: ${formatDate(m.closesAt)}`
  const headerLeft = el('div')
  headerLeft.append(tag, q, meta)

  const deltaEl = el('div', `metric-value text-${deltaCls}`)
  deltaEl.textContent = `${deltaSign}${delta}%`
  const metricDelta = el('div', 'metric')
  metricDelta.append(el('div', 'metric-label', 'Cambio 24h'), deltaEl)

  const confEl = el('div', 'metric-value text-blue')
  confEl.textContent = `${Math.round(sig.confidence * 100)}%`
  const metricConf = el('div', 'metric')
  metricConf.append(el('div', 'metric-label', 'Confianza'), confEl)

  const metrics = el('div', 'detail-metrics')
  metrics.append(metricDelta, el('div', 'metric-sep'), metricConf)

  const header = el('div', 'detail-header')
  header.append(headerLeft, metrics)

  // ── Outcomes row ──
  const sparkYes = el('div', 'sparkline')
  sparkYes.id = 'spark-yes'
  const yesPriceEl = el('div', 'outcome-price')
  yesPriceEl.textContent = formatPrice(m.yesPrice)
  const yesDeltaEl = el('div', 'outcome-delta td-green')
  yesDeltaEl.textContent = `▲ ${(m.yesPrice * 0.05).toFixed(1)}¢`
  const yesCard = el('div', 'outcome-card yes')
  yesCard.append(el('div', 'outcome-name', 'SÍ'), yesPriceEl, yesDeltaEl, sparkYes)

  const sparkNo = el('div', 'sparkline')
  sparkNo.id = 'spark-no'
  const noPriceEl = el('div', 'outcome-price')
  noPriceEl.textContent = formatPrice(m.noPrice)
  const noDeltaEl = el('div', 'outcome-delta td-red')
  noDeltaEl.textContent = `▼ ${(m.noPrice * 0.05).toFixed(1)}¢`
  const noCard = el('div', 'outcome-card no')
  noCard.append(el('div', 'outcome-name', 'NO'), noPriceEl, noDeltaEl, sparkNo)

  const detailChart = el('canvas')
  detailChart.id = 'detail-chart'
  const chartContainer = el('div', 'chart-container')
  chartContainer.append(el('div', 'chart-label', 'Historial de precios 7d'), detailChart)

  const outcomesRow = el('div', 'outcomes-row')
  outcomesRow.append(yesCard, noCard, chartContainer)

  // ── AI box ──
  const aiBadge = el('span', `signal-badge ${getSignalBadgeClass(sig.signal)}`)
  aiBadge.textContent = `${translateSignal(sig.signal).toUpperCase()} · ${Math.round(sig.confidence * 100)}%`
  const aiMeta = el('span', 'text-xs text-neutral font-mono ml-auto', 'actualizado hace 2m')
  const aiHeader = el('div', 'flex-row gap-8 mb-4 flex-wrap')
  aiHeader.append(el('div', 'ai-label', 'Análisis IA · HuggingFace Qwen3-8B'), aiBadge, aiMeta)

  // AI text built with DOM nodes — no external string ever touches innerHTML
  const aiText = el('div', 'ai-text')
  aiText.textContent = sig.summary
  if (sig.keyRisk) {
    const strong = document.createElement('strong')
    strong.textContent = 'Riesgo clave:'
    aiText.append(' ', strong, ' ', sig.keyRisk)
  }

  const aiInner = el('div', 'flex-1')
  aiInner.append(aiHeader, aiText)
  const aiBox = el('div', 'ai-box')
  aiBox.append(el('div', 'ai-icon', '◈'), aiInner)

  // ── Simulator row ──
  const simAmount = el('input', 'sim-input')
  simAmount.id = 'sim-amount'
  simAmount.type = 'number'
  simAmount.value = '100'
  simAmount.min = '1'
  simAmount.placeholder = '€'

  const simYes = el('button', 'sim-btn-yes', 'COMPRAR SÍ ↗')
  simYes.id = 'sim-yes'
  const simNo = el('button', 'sim-btn-no', 'COMPRAR NO')
  simNo.id = 'sim-no'

  const simRow = el('div', 'sim-row')
  simRow.append(
    el('span', 'sim-label', 'Simular posición →'),
    simAmount,
    simYes,
    simNo,
    el('span', 'sim-disclaimer', 'Simulado · sin trading real'),
  )

  container.replaceChildren(header, outcomesRow, aiBox, simRow)

  // Bind simulator buttons
  simYes.addEventListener('click', () => simulator.openPosition(m.id, 'SÍ', simAmount.value))
  simNo.addEventListener('click', () => simulator.openPosition(m.id, 'NO', simAmount.value))

  // Render charts
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
    tbody.replaceChildren()
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  tbody.replaceChildren()

  state.positions.forEach((p) => {
    const m = state.markets.find((x) => x.id === p.marketId) || { question: p.marketId }
    const pnlColor = p.pnl >= 0 ? 'td-green' : 'td-red'
    const sign = p.pnl >= 0 ? '+' : ''

    const tr = document.createElement('tr')

    const tdQ = el('td')
    tdQ.textContent = `${m.question.substring(0, 40)}${m.question.length > 40 ? '…' : ''}`

    const tdOutcome = el('td', `td-mono ${p.outcome === 'SÍ' ? 'td-green' : 'td-red'}`)
    tdOutcome.textContent = p.outcome

    const tdAmt = el('td', 'td-mono')
    tdAmt.textContent = `€${p.amountEur.toFixed(0)}`

    const tdEntry = el('td', 'td-mono')
    tdEntry.textContent = formatPrice(p.entryPrice)

    const tdCurrent = el('td', 'td-mono')
    tdCurrent.textContent = formatPrice(p.currentPrice)

    const tdPnl = el('td', `td-mono ${pnlColor}`)
    tdPnl.textContent = `${sign}€${p.pnl.toFixed(2)}`

    const tdKelly = el('td', 'td-mono td-blue')
    tdKelly.textContent = `${((p.kellyFraction || 0) * 100).toFixed(0)}%`

    const tdDate = el('td', 'td-mono')
    tdDate.textContent = formatDate(p.openedAt)

    const btn = el('button', 'btn-ghost', 'Cerrar')
    btn.addEventListener('click', () => closePositionById(p.id))
    const tdBtn = el('td')
    tdBtn.appendChild(btn)

    tr.append(tdQ, tdOutcome, tdAmt, tdEntry, tdCurrent, tdPnl, tdKelly, tdDate, tdBtn)
    tbody.appendChild(tr)
  })
}

async function closePositionById(id) {
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
    tbody.replaceChildren()
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  tbody.replaceChildren()

  state.watchlist.forEach((w) => {
    const m = state.markets.find((x) => x.id === w.marketId) || { question: w.marketId, category: '-', yesPrice: 0, noPrice: 0, volumeEur: 0 }
    const sig = state.signals.find((s) => s.marketId === w.marketId) || { signal: 'neutral' }

    const tr = document.createElement('tr')

    const tdQ = el('td')
    tdQ.textContent = `${m.question.substring(0, 40)}${m.question.length > 40 ? '…' : ''}`

    const tdCat = el('td')
    tdCat.textContent = m.category || '-'

    const tdYes = el('td', 'td-mono td-green')
    tdYes.textContent = formatPrice(m.yesPrice)

    const tdNo = el('td', 'td-mono td-red')
    tdNo.textContent = formatPrice(m.noPrice)

    const badge = el('span', `signal-badge ${getSignalBadgeClass(sig.signal)}`)
    badge.textContent = getSignalLabel(sig.signal)
    const tdSig = el('td')
    tdSig.appendChild(badge)

    const tdVol = el('td', 'td-mono')
    tdVol.textContent = formatCurrency(m.volumeEur || 0)

    const tdThreshold = el('td', 'td-mono')
    tdThreshold.textContent = w.alertThreshold ? formatPrice(w.alertThreshold) : '-'

    const btn = el('button', 'btn-ghost', 'Eliminar')
    btn.addEventListener('click', () => removeFromWatchlistById(w.marketId))
    const tdBtn = el('td')
    tdBtn.appendChild(btn)

    tr.append(tdQ, tdCat, tdYes, tdNo, tdSig, tdVol, tdThreshold, tdBtn)
    tbody.appendChild(tr)
  })
}

async function removeFromWatchlistById(marketId) {
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
    tbody.replaceChildren()
    empty.classList.remove('hidden')
    return
  }
  empty.classList.add('hidden')
  tbody.replaceChildren()

  state.alerts.forEach((a) => {
    const m = state.markets.find((x) => x.id === a.marketId) || { question: a.marketId }

    const tr = document.createElement('tr')

    const tdDate = el('td', 'td-mono')
    tdDate.textContent = new Date(a.sentAt).toLocaleString('es-ES')

    const tdQ = el('td')
    tdQ.textContent = `${m.question.substring(0, 35)}${m.question.length > 35 ? '…' : ''}`

    const typeBadge = el('span', 'signal-badge sig-neut')
    typeBadge.textContent = a.type
    const tdType = el('td')
    tdType.appendChild(typeBadge)

    const tdMsg = el('td')
    tdMsg.textContent = a.message

    tr.append(tdDate, tdQ, tdType, tdMsg)
    tbody.appendChild(tr)
  })
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
  document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar)

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => switchView(item.dataset.view))
  })

  document.querySelectorAll('.panel-header[data-panel]').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('button, input, a')) return
      togglePanel(item.dataset.panel)
    })
  })

  await loadMarkets()
  await loadSignals()
  await loadPositions()
  await loadWatchlist()
  await loadAlerts()

  map.init('map-container', state.markets, state.signals, selectMarket)
  simulator.init(state)

  state.activeMarketId = state.markets[0]?.id || null
  renderSignals()
  renderDetail()
  renderMiniPositions()

  const socket = io()
  socket.on('connect', () => console.log('Socket.io conectado'))

  socket.on('market_update', (data) => {
    const m = state.markets.find((x) => x.id === data.marketId)
    if (m) {
      // Only copy known numeric fields — never merge the whole payload
      if (typeof data.yesPrice === 'number') m.yesPrice = data.yesPrice
      if (typeof data.noPrice === 'number') m.noPrice = data.noPrice
      if (typeof data.volumeEur === 'number') m.volumeEur = data.volumeEur
      if (typeof data.liquidityEur === 'number') m.liquidityEur = data.liquidityEur
      if (state.activeMarketId === data.marketId) renderDetail()
      renderSignals()
      map.updateBubble(data.marketId, data.yesPrice)
    }
  })

  socket.on('ai_signal', (data) => {
    if (!data?.marketId || typeof data.signal !== 'string') return
    const idx = state.signals.findIndex((s) => s.marketId === data.marketId)
    if (idx >= 0) state.signals[idx] = data
    else state.signals.push(data)
    renderSignals()
    if (state.activeMarketId === data.marketId) renderDetail()
  })

  socket.on('price_alert', (data) => {
    if (!data?.marketId || !data.type) return
    state.alerts.unshift(data)
    if (state.view === 'alerts') renderAlerts()
  })

  setInterval(() => {
    const statMarkets = document.getElementById('stat-markets')
    if (statMarkets) {
      const n = parseInt(statMarkets.textContent.replace(/\./g, '')) + Math.floor(Math.random() * 3)
      statMarkets.textContent = n.toLocaleString('es-ES')
    }
    const statSignals = document.getElementById('stat-signals')
    if (statSignals && Math.random() > 0.7) {
      statSignals.textContent = parseInt(statSignals.textContent) + 1
    }
  }, 3000)
}
