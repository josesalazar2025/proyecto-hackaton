/**
 * Modulo de visualizacion del mapa mundial interactivo con Leaflet.js.
 *
 * Responsabilidades:
 *   - init(containerId, markets, signals, onSelect) → renderiza mapa con burbujas.
 *   - updateBubble(marketId, newPrice) → ajusta radio de la burbuja.
 *   - highlightMarket(marketId)        → resalta burbuja y abre popup.
 *
 * Burbujas:
 *   - Color  = senal IA (verde bullish, rojo bearish, naranja neutral).
 *   - Radio  = volumen del mercado.
 *   - Label  = countryCode (ISO2).
 *
 * Seguridad:
 *   - Todos los textos del popup se crean con textContent (evita XSS).
 *   - No se usa innerHTML con datos externos.
 *
 * Tile layer: CartoDB Dark Matter (requiere conexion a internet).
 *
 * Consumido por:
 *   - app.js → init() y eventos de socket.io (market_update, ai_signal).
 */

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCoordsByCode, detectCountryInText } from './capitals.js'

let mapInstance = null
let bubbles = {} // marketId -> marcador de circulo

function getCoords(market) {
  // 1. intentar por countryCode ISO2 del mercado
  const byCode = getCoordsByCode(market.countryCode)
  if (byCode) return byCode

  // 2. fallback: detectar país en el texto de la pregunta
  const byText = detectCountryInText(market.question)
  if (byText) return byText

  // 3. default centrado en África (coordenadas genéricas)
  return [20, 0]
}

function getSignalColor(signal) {
  if (signal === 'bullish') return '#22d37a'
  if (signal === 'bearish') return '#f04040'
  return '#f0a020'
}

function getRadius(volumeEur) {
  const v = volumeEur || 0
  if (v > 2e6) return 18
  if (v > 1e6) return 14
  if (v > 500000) return 11
  if (v > 200000) return 8
  return 6
}

export function init(containerId, markets, signals, onSelect) {
  const container = document.getElementById(containerId)
  if (!container) return

  mapInstance = L.map(container, {
    zoomControl: false,
    attributionControl: false,
    minZoom: 2,
    maxZoom: 6,
    worldCopyJump: true,
  }).setView([25, 10], 2)

  // Capa de tiles oscura (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy;OpenStreetMap &copy;CartoDB',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapInstance)

  markets.forEach((m) => {
    const sig = signals.find((s) => s.marketId === m.id) || { signal: 'neutral' }
    const color = getSignalColor(sig.signal)
    const coords = getCoords(m)
    const radius = getRadius(m.volumeEur)

    const circle = L.circleMarker(coords, {
      radius,
      fillColor: color,
      color: color,
      weight: 1.5,
      opacity: 0.6,
      fillOpacity: 0.22,
    }).addTo(mapInstance)

    const inner = L.circleMarker(coords, {
      radius: Math.max(3, radius * 0.45),
      fillColor: color,
      color: 'transparent',
      fillOpacity: 0.8,
    }).addTo(mapInstance)

    // Construye texto de etiqueta de forma segura via textContent antes de obtener outerHTML
    const labelSpan = document.createElement('span')
    labelSpan.className = 'map-label-text'
    labelSpan.textContent = m.countryCode || 'GL'

    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'map-label',
        html: labelSpan.outerHTML,
        iconSize: [40, 14],
        iconAnchor: [20, -radius - 4],
      }),
      interactive: false,
    }).addTo(mapInstance)

    // Construye DOM del popup — textContent previene cualquier inyeccion HTML desde datos del mercado
    const popup = document.createElement('div')
    popup.className = 'map-popup'
    const popupCat = document.createElement('div')
    popupCat.className = 'map-popup-cat'
    popupCat.textContent = `${m.category || 'General'} · ${m.countryCode || 'GL'}`
    const popupQ = document.createElement('div')
    popupQ.className = 'map-popup-q'
    popupQ.textContent = m.question
    const popupPrices = document.createElement('div')
    popupPrices.className = 'map-popup-prices'
    const yesSpan = document.createElement('span')
    yesSpan.className = 'text-green'
    yesSpan.textContent = `SÍ ${Math.round((m.yesPrice || 0) * 100)}¢`
    const noSpan = document.createElement('span')
    noSpan.className = 'text-red'
    noSpan.textContent = `NO ${Math.round((m.noPrice || 0) * 100)}¢`
    popupPrices.append(yesSpan, noSpan)
    popup.append(popupCat, popupQ, popupPrices)
    circle.bindPopup(popup, { closeButton: false, offset: [0, -4] })

    circle.on('click', () => {
      onSelect(m.id)
    })

    bubbles[m.id] = { circle, inner, label, color }
  })
}

export function updateBubble(marketId, newPrice) {
  const b = bubbles[marketId]
  if (!b) return
  // Ajusta ligeramente el radio basado en nueva actividad (comportamiento simulado)
  const newRadius = b.circle.getRadius() + (Math.random() > 0.5 ? 0.5 : -0.5)
  b.circle.setRadius(Math.max(5, Math.min(22, newRadius)))
}

export function highlightMarket(marketId) {
  Object.values(bubbles).forEach((b) => {
    b.circle.setStyle({ weight: 1.5, opacity: 0.6 })
  })
  const b = bubbles[marketId]
  if (b) {
    b.circle.setStyle({ weight: 3, opacity: 1, color: '#4a9eff' })
    b.circle.openPopup()
  }
}
