/**
 * Utilidades de geolocalización basadas en la aportación de Arnau.
 * Importa datos de capitales desde JSON estático y construye índices
 * para búsqueda O(1) por código ISO y búsqueda por nombre.
 */

import capitals from './capitals.json'

// Índice para búsqueda O(1) por código ISO
const coordsByCode = new Map()
for (const c of capitals) {
  if (c.pais_codigo) coordsByCode.set(c.pais_codigo.toUpperCase(), [c.latitud, c.longitud])
}

// Índice para búsqueda de respaldo por nombre (país y capital)
const nameIndex = new Map()
for (const c of capitals) {
  nameIndex.set(c.pais.toLowerCase(), [c.latitud, c.longitud])
  nameIndex.set(c.capital.toLowerCase(), [c.latitud, c.longitud])
}

/**
 * Obtiene coordenadas por código de país ISO2.
 * Recurre al dataset expandido de Arnau si no está en la lista hardcoded.
 */
export function getCoordsByCode(countryCode) {
  const code = countryCode?.toUpperCase()
  if (!code) return null

  // Resguardo heredado hardcoded (mantenido por compatibilidad)
  const legacy = {
    US: [37.09, -95.71], DE: [51.16, 10.45], GB: [55.37, -3.43],
    BR: [-14.23, -51.92], CN: [35.86, 104.19], IN: [20.59, 78.96],
    KR: [35.90, 127.76], SA: [23.88, 45.07], FR: [46.22, 2.21],
    JP: [36.20, 138.25], AU: [-25.27, 133.77], CA: [56.13, -106.34],
    RU: [61.52, 105.31], MX: [23.63, -102.55], ZA: [-30.55, 22.93],
  }
  return legacy[code] || coordsByCode.get(code) || null
}

/**
 * Detecta país en el texto de la pregunta de un mercado.
 * Devuelve coordenadas si se encuentra un país o capital conocido, null en caso contrario.
 * Seguro: solo lee texto, sin inyección DOM.
 */
export function detectCountryInText(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const [key, coords] of nameIndex) {
    if (lower.includes(key)) return coords
  }
  return null
}
