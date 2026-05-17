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

// Hubs globales para mercados sin pais. Cubre TODOS los continentes para
// que las bubbles no se concentren en US/EU/Asia. Cada hub tiene tambien un
// "spread" propio para que multiples markets en el mismo hub se repartan.
const FINANCIAL_HUBS = [
  // America del Norte
  [40.71, -74.0],    // Nueva York
  [37.77, -122.42],  // San Francisco
  [41.88, -87.63],   // Chicago
  [43.65, -79.38],   // Toronto
  [19.43, -99.13],   // Ciudad de Mexico
  // America Latina
  [-23.55, -46.63],  // Sao Paulo
  [-34.61, -58.38],  // Buenos Aires
  [-33.45, -70.66],  // Santiago de Chile
  [4.71, -74.07],    // Bogota
  [10.49, -66.88],   // Caracas
  // Europa
  [51.5, -0.13],     // Londres
  [50.11, 8.68],     // Frankfurt
  [48.85, 2.35],     // Paris
  [40.42, -3.7],     // Madrid
  [41.9, 12.5],      // Roma
  [47.37, 8.54],     // Zurich
  [52.37, 4.9],      // Amsterdam
  [55.75, 37.62],    // Moscu
  [50.45, 30.52],    // Kyiv
  [41.0, 28.98],     // Estambul
  // Africa
  [-26.2, 28.05],    // Johannesburgo
  [6.45, 3.4],       // Lagos
  [30.04, 31.24],    // Cairo
  [-1.29, 36.82],    // Nairobi
  [33.97, -6.85],    // Rabat
  // Oriente Medio
  [25.2, 55.27],     // Dubai
  [24.71, 46.68],    // Riad
  [32.07, 34.78],    // Tel Aviv
  // Asia
  [22.3, 114.17],    // Hong Kong
  [35.68, 139.69],   // Tokio
  [1.35, 103.82],    // Singapur
  [31.23, 121.47],   // Shanghai
  [19.08, 72.88],    // Mumbai
  [37.57, 126.98],   // Seul
  [13.76, 100.5],    // Bangkok
  [-6.21, 106.85],   // Yakarta
  [25.03, 121.56],   // Taipei
  // Oceania
  [-33.87, 151.21],  // Sydney
  [-37.81, 144.96],  // Melbourne
  [-36.85, 174.76],  // Auckland
]

// Hash determinista para jitter reproducible por marketId
function hashCode(str) {
  let h = 0
  const s = String(str)
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Tamano aproximado de cada pais (radio en grados, lat/lng).
// Paises grandes → mas jitter para repartir bubbles por su territorio.
// Default 3.5° si no esta listado.
// Bounding-box approximado de cada pais (semi-eje lat, semi-eje lng en grados).
// Paises grandes → caja grande para repartir las bubbles por todo el territorio.
const COUNTRY_JITTER = {
  US: [14, 32],   // EEUU: NY (-74) a LA (-118), TX (29) a MN (49)
  RU: [12, 55],   // Rusia: cruza 11 husos horarios
  CA: [11, 35],
  CN: [13, 25],
  BR: [13, 18],
  AU: [11, 22],
  IN: [10, 14],
  AR: [14, 10],
  MX: [8, 13],
  KZ: [7, 22],
  DZ: [10, 11],
  SA: [9, 11],
  CD: [9, 9],
  GB: [4, 4],
  DE: [4, 5],
  FR: [5, 5],
  ES: [5, 6],
  IT: [5, 5],
  JP: [6, 8],
  TR: [4, 9],
  IR: [7, 9],
  IL: [1.2, 1.2],
  UA: [5, 9],
  KR: [2.5, 2.5],
  ZA: [6, 8],
  NG: [5, 6],
  EG: [5, 6],
  ID: [6, 22],
}

// Distribucion UNIFORME en un rectangulo (no en elipse polar, que clumpea
// hacia el centro). Cada market id mapea a un (dx,dy) deterministico que
// cubre toda la bounding box del pais.
function jitter(coords, marketId, amount = 4) {
  const h = hashCode(marketId)
  const [latR, lngR] = Array.isArray(amount) ? amount : [amount, amount]
  // Dos canales de 16 bits del hash → coordenadas uniformes en [-1, 1]
  const u = ((h & 0xFFFF) / 0xFFFF) * 2 - 1
  const v = (((h >> 16) & 0xFFFF) / 0xFFFF) * 2 - 1
  return [coords[0] + v * latR, coords[1] + u * lngR]
}

function pickFinancialHub(marketId) {
  const idx = hashCode(marketId) % FINANCIAL_HUBS.length
  return FINANCIAL_HUBS[idx]
}

function getCoords(market) {
  // 1. countryCode ISO2 explicito + jitter proporcional al tamano del pais
  const byCode = getCoordsByCode(market.countryCode)
  if (byCode) {
    const amount = COUNTRY_JITTER[market.countryCode] || 3.5
    return jitter(byCode, market.id, amount)
  }

  // 2. heuristica de texto: detectamos el codigo y reaplicamos el lookup
  const byText = detectCountryInText(market.question)
  if (byText) return jitter(byText, market.id, 4)

  // 3. mercado sin pais: distribuir entre hubs financieros globales
  return jitter(pickFinancialHub(market.id), market.id, 3)
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
  window.__onSelectMarket = onSelect
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
      interactive: false,
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

export function updateBubble(marketId) {
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

export function updateMarkers(markets, signals) {
  if (!mapInstance) return

  // Limpiar burbujas existentes
  Object.values(bubbles).forEach((b) => {
    mapInstance.removeLayer(b.circle)
    mapInstance.removeLayer(b.inner)
    mapInstance.removeLayer(b.label)
  })
  bubbles = {}

  // Re-renderizar solo los mercados filtrados
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
      interactive: false,
    }).addTo(mapInstance)

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
      if (window.__onSelectMarket) window.__onSelectMarket(m.id)
    })

    bubbles[m.id] = { circle, inner, label, color }
  })
}
