/**
 * Logica principal de la SPA PolySignal (Single Page Application).
 *
 * Responsabilidades:
 *   - Routing de vistas: dashboard, positions, watchlist, alerts.
 *   - Sidebar colapsable y paneles del dashboard plegables individualmente.
 *   - Carga inicial de datos desde la API REST (mercados, senales, posiciones, watchlist, alertas).
 *   - Actualizaciones en tiempo real via Socket.io:
 *       * market_update → refresca precios, volumen y mapa.
 *       * ai_signal     → actualiza badges de senal IA en el panel.
 *       * price_alert   → anade alertas al historial.
 *   - Renderizado del panel de detalle de mercado con sparklines, grafico 7d,
 *     analisis IA y simulador de posiciones virtuales.
 *   - Auto-login con credenciales demo para endpoints protegidos.
 *
 * Modulos importados:
 *   - api.js       → cliente REST del backend (con JWT).
 *   - charts.js    → Chart.js (historial 7d + sparklines).
 *   - map.js       → Leaflet (mapa mundial interactivo).
 *   - simulator.js → logica de compra/venta virtual.
 *
 * Seguridad del frontend:
 *   - Todo el DOM se construye con document.createElement() + textContent.
 *   - Nunca se usa innerHTML con datos externos (mitiga XSS).
 *   - Socket.io valida tipos de datos antes de actualizar el estado.
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
  signalsOffset: 0,
  signalsHasMore: true,
  signalsLoading: false,
}

let signalsObserver = null

/* ─── Helpers ─── */
function formatCurrency(n) {
  if (!n || n === 0) return '€0'
  if (n >= 1e6) return '€' + (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return '€' + (n / 1e3).toFixed(1) + 'K'
  return '€' + n.toFixed(0)
}

function formatPrice(p) {
  return Math.round((p || 0) * 100) + '¢'
}

function formatDate(iso) {
  if (!iso) return '—'
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

function translateOutcome(outcome) {
  if (outcome === 'YES') return 'SÍ'
  if (outcome === 'NO') return 'NO'
  return outcome
}

// Crea un elemento con una clase opcional y contenido de texto opcional
function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function emptyState(text, sm = false) {
  return el('div', sm ? 'empty-state empty-state-sm' : 'empty-state', text)
}

/* ─── Auth Modal ─── */
function openAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('hidden')
}

function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.add('hidden')
  const loginError = document.getElementById('login-error')
  const registerError = document.getElementById('register-error')
  if (loginError) loginError.textContent = ''
  if (registerError) registerError.textContent = ''
}

function switchAuthTab(tab) {
  document.querySelectorAll('.modal-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab))
  document.querySelectorAll('.modal-form').forEach((f) => f.classList.toggle('active', f.id === `form-${tab}`))
  const loginError = document.getElementById('login-error')
  const registerError = document.getElementById('register-error')
  if (loginError) loginError.textContent = ''
  if (registerError) registerError.textContent = ''
}

/* ─── Telegram Modal ─── */
function openTelegramModal() {
  const modal = document.getElementById('telegram-modal')
  if (!modal) return
  // Load saved settings from localStorage
  const saved = JSON.parse(localStorage.getItem('telegramConfig') || '{}')
  document.getElementById('telegram-bot-token').value = saved.botToken || ''
  document.getElementById('telegram-chat-id').value = saved.chatId || ''
  document.getElementById('telegram-enabled').checked = saved.enabled || false
  const statusEl = document.getElementById('telegram-status')
  if (statusEl) {
    statusEl.textContent = ''
    statusEl.className = 'form-status'
  }
  modal.classList.remove('hidden')
}

function closeTelegramModal() {
  document.getElementById('telegram-modal')?.classList.add('hidden')
  const statusEl = document.getElementById('telegram-status')
  if (statusEl) {
    statusEl.textContent = ''
    statusEl.className = 'form-status'
  }
}

function handleTelegramSave(e) {
  e.preventDefault()
  const botToken = document.getElementById('telegram-bot-token').value.trim()
  const chatId = document.getElementById('telegram-chat-id').value.trim()
  const enabled = document.getElementById('telegram-enabled').checked
  const statusEl = document.getElementById('telegram-status')

  if (enabled && (!botToken || !chatId)) {
    statusEl.textContent = 'Completa token y chat ID para activar alertas.'
    statusEl.className = 'form-status error'
    return
  }

  localStorage.setItem('telegramConfig', JSON.stringify({ botToken, chatId, enabled }))
  statusEl.textContent = 'Configuración guardada correctamente.'
  statusEl.className = 'form-status success'

  setTimeout(() => closeTelegramModal(), 1200)
}

function handleTelegramTest() {
  const botToken = document.getElementById('telegram-bot-token').value.trim()
  const chatId = document.getElementById('telegram-chat-id').value.trim()
  const statusEl = document.getElementById('telegram-status')

  if (!botToken || !chatId) {
    statusEl.textContent = 'Introduce token y chat ID antes de probar.'
    statusEl.className = 'form-status error'
    return
  }

  statusEl.textContent = 'Enviando mensaje de prueba…'
  statusEl.className = 'form-status'

  // Real call to Telegram Bot API
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '🧪 PolySignal — Mensaje de prueba\n\nLas alertas de Telegram están configuradas correctamente.',
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        statusEl.textContent = 'Mensaje de prueba enviado. Revisa Telegram.'
        statusEl.className = 'form-status success'
      } else {
        statusEl.textContent = `Error de Telegram: ${data.description || 'verifica token y chat ID'}`
        statusEl.className = 'form-status error'
      }
    })
    .catch(() => {
      statusEl.textContent = 'No se pudo conectar con Telegram. Revisa tu conexión.'
      statusEl.className = 'form-status error'
    })
}

function updateAuthButton() {
  const btn = document.getElementById('btn-auth')
  const indicator = document.getElementById('btn-auth-mobile')
  const authed = api.isAuthenticated()

  if (btn) {
    if (authed) {
      btn.textContent = 'Salir'
      btn.onclick = () => {
        api.logout()
        updateAuthButton()
        location.reload()
      }
    } else {
      btn.textContent = 'Entrar'
      btn.onclick = openAuthModal
    }
  }

  if (indicator) {
    indicator.classList.toggle('logged-in', authed)
    indicator.title = authed ? 'Salir' : 'Entrar'
    indicator.onclick = authed
      ? () => {
          api.logout()
          updateAuthButton()
          location.reload()
        }
      : openAuthModal
  }
}

async function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value
  const errorEl = document.getElementById('login-error')
  try {
    await api.login(email, password)
    closeAuthModal()
    updateAuthButton()
    await initAppData()
  } catch (err) {
    errorEl.textContent = 'Credenciales incorrectas. Inténtalo de nuevo.'
  }
}

async function handleRegister(e) {
  e.preventDefault()
  const email = document.getElementById('register-email').value.trim()
  const password = document.getElementById('register-password').value
  const confirm = document.getElementById('register-password-confirm').value
  const errorEl = document.getElementById('register-error')

  if (password !== confirm) {
    errorEl.textContent = 'Las contraseñas no coinciden.'
    return
  }
  if (password.length < 8) {
    errorEl.textContent = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  try {
    await api.register(email, password)
    closeAuthModal()
    updateAuthButton()
    await initAppData()
  } catch (err) {
    errorEl.textContent = 'Error al registrar. El correo podría estar en uso.'
  }
}

async function ensureAuth() {
  if (api.isAuthenticated()) return true
  return false
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

/* ─── Signal card factory ─── */
function makeSignalCard(m) {
  const sig = state.signals.find((s) => s.marketId === m.id) || { signal: 'neutral', confidence: 0.5 }
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
  probFill.style.setProperty('--prob-width', `${Math.round((m.yesPrice || 0) * 100)}%`)
  probBg.appendChild(probFill)
  probWrap.appendChild(probBg)

  const probVal = el('span', `prob-val text-${cls}`)
  probVal.textContent = formatPrice(m.yesPrice)

  const badge = el('span', `signal-badge ${getSignalBadgeClass(sig.signal)}`)
  badge.textContent = getSignalLabel(sig.signal)

  footer.append(probWrap, probVal, badge)
  card.append(cat, q, footer)
  card.addEventListener('click', () => selectMarket(card.dataset.market))
  return card
}

function attachSignalsObserver(container) {
  if (signalsObserver) signalsObserver.disconnect()
  const sentinel = el('div', 'signals-sentinel', 'Cargando…')
  container.appendChild(sentinel)

  const isMobile = window.matchMedia('(max-width: 640px)').matches
  const panelBody = container.closest('.panel-body')
  const root = isMobile ? null : panelBody

  signalsObserver = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadMoreMarkets() },
    { root, threshold: 0.1 },
  )
  signalsObserver.observe(sentinel)
}

/* ─── Render signals list ─── */
function renderSignals() {
  const container = document.getElementById('signals-list')
  if (!container) return

  if (signalsObserver) { signalsObserver.disconnect(); signalsObserver = null }
  container.replaceChildren()

  if (state.markets.length === 0) {
    container.appendChild(emptyState('No hay mercados disponibles'))
    return
  }

  state.markets.forEach((m) => container.appendChild(makeSignalCard(m)))
  if (state.signalsHasMore) attachSignalsObserver(container)
}

function appendSignalCards(newMarkets) {
  const container = document.getElementById('signals-list')
  if (!container) return
  container.querySelector('.signals-sentinel')?.remove()
  if (signalsObserver) { signalsObserver.disconnect(); signalsObserver = null }
  newMarkets.forEach((m) => container.appendChild(makeSignalCard(m)))
  if (state.signalsHasMore) attachSignalsObserver(container)
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
    const m = state.markets.find((x) => x.id === p.marketId) || p.market || { question: p.marketId }
    netPnl += p.pnl || 0
    const cls = (p.pnl || 0) >= 0 ? 'green' : 'red'
    const sign = (p.pnl || 0) >= 0 ? '+' : ''

    const row = el('div', 'flex-between mb-6')
    const label = el('span', 'text-sm text-neutral font-mono')
    label.textContent = `${(m.question || p.marketId).substring(0, 32)}${(m.question || p.marketId).length > 32 ? '…' : ''} ${translateOutcome(p.outcome)}`
    const val = el('span', `text-base font-semibold text-${cls} font-mono`)
    val.textContent = `${sign}€${(p.pnl || 0).toFixed(2)}`
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

/* ─── Build detail DOM (shared between desktop panel and mobile inline) ─── */
function buildDetailDOM(m, sig, prefix = '') {
  const chartId = `${prefix}detail-chart`
  const sparkYesId = `${prefix}spark-yes`
  const sparkNoId = `${prefix}spark-no`

  const delta = ((m.yesPrice - 0.5) * 20).toFixed(1)
  const deltaCls = (m.yesPrice || 0) > 0.5 ? 'green' : 'red'
  const deltaSign = (m.yesPrice || 0) > 0.5 ? '+' : ''

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
  sparkYes.id = sparkYesId
  const yesPriceEl = el('div', 'outcome-price')
  yesPriceEl.textContent = formatPrice(m.yesPrice)
  const yesDeltaEl = el('div', 'outcome-delta td-green')
  yesDeltaEl.textContent = `▲ ${((m.yesPrice || 0) * 0.05).toFixed(1)}¢`
  const yesCard = el('div', 'outcome-card yes')
  yesCard.append(el('div', 'outcome-name', 'SÍ'), yesPriceEl, yesDeltaEl, sparkYes)

  const sparkNo = el('div', 'sparkline')
  sparkNo.id = sparkNoId
  const noPriceEl = el('div', 'outcome-price')
  noPriceEl.textContent = formatPrice(m.noPrice)
  const noDeltaEl = el('div', 'outcome-delta td-red')
  noDeltaEl.textContent = `▼ ${((m.noPrice || 0) * 0.05).toFixed(1)}¢`
  const noCard = el('div', 'outcome-card no')
  noCard.append(el('div', 'outcome-name', 'NO'), noPriceEl, noDeltaEl, sparkNo)

  const detailChart = el('canvas')
  detailChart.id = chartId
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

  // Texto IA construido con nodos DOM — ninguna cadena externa toca innerHTML
  const aiText = el('div', 'ai-text')
  aiText.textContent = sig.summary || 'Aún no hay análisis de IA disponible.'
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
  simAmount.type = 'number'
  simAmount.value = '100'
  simAmount.min = '1'
  simAmount.placeholder = '€'

  const simYes = el('button', 'sim-btn-yes', 'COMPRAR SÍ ↗')
  const simNo = el('button', 'sim-btn-no', 'COMPRAR NO')

  const simRow = el('div', 'sim-row')
  simRow.append(
    el('span', 'sim-label', 'Simular posición →'),
    simAmount,
    simYes,
    simNo,
    el('span', 'sim-disclaimer', 'Simulado · sin trading real'),
  )

  simYes.addEventListener('click', () => simulator.openPosition(m.id, 'YES', simAmount.value))
  simNo.addEventListener('click', () => simulator.openPosition(m.id, 'NO', simAmount.value))

  const content = el('div')
  content.append(header, outcomesRow, aiBox, simRow)

  return { content, chartId, sparkYesId, sparkNoId }
}

/* ─── Render detail panel (desktop) ─── */
function renderDetail() {
  const container = document.getElementById('detail-body')
  if (!container) return
  const m = state.markets.find((x) => x.id === state.activeMarketId)
  if (!m) {
    container.replaceChildren(emptyState('Selecciona un mercado para ver detalles'))
    return
  }

  const sig = state.signals.find((s) => s.marketId === m.id) || {
    signal: 'neutral',
    confidence: 0.5,
    summary: 'Aún no hay análisis de IA disponible.',
    keyRisk: '',
  }

  const { content, chartId, sparkYesId, sparkNoId } = buildDetailDOM(m, sig)
  container.replaceChildren(content)

  charts.renderDetailChart(chartId, m.yesPrice)
  charts.renderSparkline(sparkYesId, m.yesPrice, 'yes')
  charts.renderSparkline(sparkNoId, m.noPrice, 'no')
}

/* ─── Select market ─── */
function selectMarket(marketId) {
  const isMobile = window.matchMedia('(max-width: 640px)').matches

  if (isMobile) {
    // Collapse any open inline detail and clear active state
    document.querySelectorAll('.market-card-detail').forEach((d) => d.remove())
    document.querySelectorAll('#signals-list .market-card.active').forEach((c) => c.classList.remove('active'))

    // Toggle off if same card clicked again
    if (state.activeMarketId === marketId) {
      state.activeMarketId = null
      return
    }

    state.activeMarketId = marketId
    map.highlightMarket(marketId)

    const card = document.querySelector(`#signals-list .market-card[data-market="${CSS.escape(marketId)}"]`)
    if (!card) return
    card.classList.add('active')

    const m = state.markets.find((x) => x.id === marketId)
    if (!m) return

    const sig = state.signals.find((s) => s.marketId === marketId) || {
      signal: 'neutral',
      confidence: 0.5,
      summary: 'Aún no hay análisis de IA disponible.',
      keyRisk: '',
    }

    const { content, chartId, sparkYesId, sparkNoId } = buildDetailDOM(m, sig, 'inline-')
    const wrapper = el('div', 'market-card-detail')
    wrapper.appendChild(content)
    card.after(wrapper)

    // Charts require the canvas to be in the DOM before rendering
    requestAnimationFrame(() => {
      charts.renderDetailChart(chartId, m.yesPrice)
      charts.renderSparkline(sparkYesId, m.yesPrice, 'yes')
      charts.renderSparkline(sparkNoId, m.noPrice, 'no')
    })
  } else {
    state.activeMarketId = marketId
    renderSignals()
    renderDetail()
    map.highlightMarket(marketId)
  }
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
    const m = state.markets.find((x) => x.id === p.marketId) || p.market || { question: p.marketId }
    const pnlColor = (p.pnl || 0) >= 0 ? 'td-green' : 'td-red'
    const sign = (p.pnl || 0) >= 0 ? '+' : ''

    const tr = document.createElement('tr')

    const tdQ = el('td')
    tdQ.textContent = `${(m.question || p.marketId).substring(0, 40)}${(m.question || p.marketId).length > 40 ? '…' : ''}`

    const tdOutcome = el('td', `td-mono ${p.outcome === 'YES' ? 'td-green' : 'td-red'}`)
    tdOutcome.textContent = translateOutcome(p.outcome)

    const tdAmt = el('td', 'td-mono')
    tdAmt.textContent = `€${p.amountEur.toFixed(0)}`

    const tdEntry = el('td', 'td-mono')
    tdEntry.textContent = formatPrice(p.entryPrice)

    const tdCurrent = el('td', 'td-mono')
    tdCurrent.textContent = formatPrice(p.currentPrice)

    const tdPnl = el('td', `td-mono ${pnlColor}`)
    tdPnl.textContent = `${sign}€${(p.pnl || 0).toFixed(2)}`

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
    const m = state.markets.find((x) => x.id === w.marketId) || w.market || { question: w.marketId, category: '-', yesPrice: 0, noPrice: 0, volumeEur: 0 }
    const sig = state.signals.find((s) => s.marketId === w.marketId) || { signal: 'neutral' }

    const tr = document.createElement('tr')

    const tdQ = el('td')
    tdQ.textContent = `${(m.question || w.marketId).substring(0, 40)}${(m.question || w.marketId).length > 40 ? '…' : ''}`

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
    const m = state.markets.find((x) => x.id === a.marketId) || a.market || { question: a.marketId }

    const tr = document.createElement('tr')

    const tdDate = el('td', 'td-mono')
    tdDate.textContent = new Date(a.sentAt).toLocaleString('es-ES')

    const tdQ = el('td')
    tdQ.textContent = `${(m.question || a.marketId).substring(0, 35)}${(m.question || a.marketId).length > 35 ? '…' : ''}`

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
    const batch = await api.getMarkets({ limit: 20, offset: 0 })
    state.markets = Array.isArray(batch) ? batch : []
    state.signalsOffset = state.markets.length
    state.signalsHasMore = state.markets.length === 20
  } catch (e) {
    console.error('Error cargando mercados:', e)
    state.markets = []
    state.signalsOffset = 0
    state.signalsHasMore = false
  }
}

async function loadMoreMarkets() {
  if (state.signalsLoading || !state.signalsHasMore) return
  state.signalsLoading = true
  try {
    const batch = await api.getMarkets({ limit: 20, offset: state.signalsOffset })
    const arr = Array.isArray(batch) ? batch : []
    if (arr.length === 0) {
      state.signalsHasMore = false
      document.querySelector('.signals-sentinel')?.remove()
      if (signalsObserver) { signalsObserver.disconnect(); signalsObserver = null }
    } else {
      state.markets.push(...arr)
      state.signalsOffset += arr.length
      state.signalsHasMore = arr.length === 20
      try {
        const newSigs = await api.getSignalsBatch(arr.map((m) => m.id))
        state.signals.push(...newSigs.map((r) => ({ ...r, marketId: r.marketId })))
      } catch (e) { /* signals are optional */ }
      appendSignalCards(arr)
    }
  } catch (e) {
    console.error('Error cargando más mercados:', e)
  } finally {
    state.signalsLoading = false
  }
}

async function loadSignals() {
  if (state.markets.length === 0) {
    state.signals = []
    return
  }
  try {
    const marketIds = state.markets.map((m) => m.id)
    const results = await api.getSignalsBatch(marketIds)
    state.signals = results.map((r) => ({ ...r, marketId: r.marketId }))
  } catch (e) {
    console.error('Error cargando señales:', e)
    state.signals = []
  }
}

async function loadPositions() {
  try {
    state.positions = await api.getPositions()
  } catch (e) {
    console.error('Error cargando posiciones:', e)
    state.positions = []
  }
}

async function loadWatchlist() {
  try {
    state.watchlist = await api.getWatchlist()
  } catch (e) {
    console.error('Error cargando watchlist:', e)
    state.watchlist = []
  }
}

async function loadAlerts() {
  try {
    state.alerts = await api.getAlerts()
  } catch (e) {
    console.error('Error cargando alertas:', e)
    state.alerts = []
  }
}

async function loadStats() {
  try {
    const stats = await api.getStats()
    const statMarkets = document.getElementById('stat-markets')
    if (statMarkets) statMarkets.textContent = (stats.marketsCount ?? 0).toLocaleString('es-ES')
    const statVolume = document.getElementById('stat-volume')
    if (statVolume) statVolume.textContent = formatCurrency(stats.volume24h || 0)
    const statSignals = document.getElementById('stat-signals')
    if (statSignals) statSignals.textContent = stats.signalsCount ?? 0
    const statAlerts = document.getElementById('stat-alerts')
    if (statAlerts) statAlerts.textContent = stats.alertsToday ?? 0
  } catch (e) {
    console.error('Error cargando stats:', e)
  }
}

/* ─── Carga de datos de la app ─── */
async function initAppData() {
  await loadMarkets()
  await loadSignals()
  await loadPositions()
  await loadWatchlist()
  await loadAlerts()
  await loadStats()

  map.init('map-container', state.markets, state.signals, selectMarket)
  simulator.init(state)

  state.activeMarketId = state.markets[0]?.id || null
  renderSignals()
  renderDetail()
  renderMiniPositions()
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

  // Telegram modal events
  document.getElementById('btn-telegram')?.addEventListener('click', openTelegramModal)
  document.getElementById('btn-telegram-mobile')?.addEventListener('click', openTelegramModal)
  document.getElementById('telegram-modal-close')?.addEventListener('click', closeTelegramModal)
  document.getElementById('telegram-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'telegram-modal') closeTelegramModal()
  })
  document.getElementById('form-telegram')?.addEventListener('submit', handleTelegramSave)
  document.getElementById('btn-test-telegram')?.addEventListener('click', handleTelegramTest)

  // Auth modal events
  document.getElementById('btn-auth')?.addEventListener('click', openAuthModal)
  document.getElementById('modal-close')?.addEventListener('click', closeAuthModal)
  document.querySelectorAll('.modal-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab))
  })
  document.getElementById('form-login')?.addEventListener('submit', handleLogin)
  document.getElementById('form-register')?.addEventListener('submit', handleRegister)
  document.getElementById('auth-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal') closeAuthModal()
  })

  updateAuthButton()

  // Si hay token, carga datos; si no, muestra el modal
  const authed = await ensureAuth()
  if (authed) {
    await initAppData()
  } else {
    openAuthModal()
  }

  const socket = io()
  socket.on('connect', () => console.log('Socket.io conectado'))

  socket.on('market_update', (data) => {
    const m = state.markets.find((x) => x.id === data.marketId)
    if (m) {
      // Solo copia campos numericos conocidos — nunca mezcle todo el payload
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
}
