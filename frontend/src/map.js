/**
 * Módulo de visualización del mapa mundial interactivo.
 *
 * Tecnología: Leaflet.js
 *
 * Funciones:
 *   - Renderizar mapa base centrado en coordenadas por defecto
 *   - Dibujar burbujas (circle markers) por país usando countryCode (ISO2)
 *   - Color de burbuja según señal IA dominante (verde/amarillo/rojo)
 *   - Tamaño proporcional al volumen o liquidez del mercado
 *   - Popup al hacer click con detalle del mercado
 *
 * Recibe actualizaciones en tiempo real vía Socket.io desde app.js.
 */

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
