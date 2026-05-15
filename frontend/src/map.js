/**
 * Módulo de visualización del mapa mundial interactivo con Leaflet.js.
 *
 * Funciones:
 *   - init(containerId, markets, signals, onSelect)
 *   - updateBubble(marketId, newPrice)
 *   - highlightMarket(marketId)
 */

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas aproximadas por countryCode ISO2
const COORDS = {
  US: [37.09, -95.71],
  DE: [51.16, 10.45],
  GB: [55.37, -3.43],
  BR: [-14.23, -51.92],
  CN: [35.86, 104.19],
  IN: [20.59, 78.96],
  KR: [35.90, 127.76],
  SA: [23.88, 45.07],
  FR: [46.22, 2.21],
  JP: [36.20, 138.25],
  AU: [-25.27, 133.77],
  CA: [56.13, -106.34],
  RU: [61.52, 105.31],
  MX: [23.63, -102.55],
  ZA: [-30.55, 22.93],
}

let mapInstance = null
let bubbles = {} // marketId -> circle marker

function getCoords(countryCode) {
  return COORDS[countryCode?.toUpperCase()] || [20, 0]
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

  // Dark tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy;OpenStreetMap &copy;CartoDB',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapInstance)

  markets.forEach((m) => {
    const sig = signals.find((s) => s.marketId === m.id) || { signal: 'neutral' }
    const color = getSignalColor(sig.signal)
    const coords = getCoords(m.countryCode)
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

    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'map-label',
        html: `<span class="map-label-text">${m.countryCode || 'GL'}</span>`,
        iconSize: [40, 14],
        iconAnchor: [20, -radius - 4],
      }),
      interactive: false,
    }).addTo(mapInstance)

    const popupContent = `
      <div class="map-popup">
        <div class="map-popup-cat">${m.category || 'General'} · ${m.countryCode || 'GL'}</div>
        <div class="map-popup-q">${m.question}</div>
        <div class="map-popup-prices">
          <span class="text-green">SÍ ${Math.round((m.yesPrice || 0) * 100)}¢</span>
          <span class="text-red">NO ${Math.round((m.noPrice || 0) * 100)}¢</span>
        </div>
      </div>
    `
    circle.bindPopup(popupContent, { closeButton: false, offset: [0, -4] })

    circle.on('click', () => {
      onSelect(m.id)
    })

    bubbles[m.id] = { circle, inner, label, color }
  })
}

export function updateBubble(marketId, newPrice) {
  const b = bubbles[marketId]
  if (!b) return
  // Slightly adjust radius based on new activity (mock behavior)
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
