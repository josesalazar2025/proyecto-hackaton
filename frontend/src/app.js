/**
 * Punto de entrada del frontend (Vanilla JS).
 *
 * Responsabilidades:
 *   - Inicializar conexion Socket.io y escuchar eventos:
 *       'market_update', 'ai_signal', 'price_alert'
 *   - Orchestrar la carga inicial de datos (mercados, posiciones, watchlist)
 *   - Conectar los modulos: map.js, charts.js, simulator.js, api.js
 *
 * Se ejecuta al cargar index.html.
 */

import { io } from 'socket.io-client'
import * as api from './api.js'
import * as charts from './charts.js'
import * as map from './map.js'
import * as simulator from './simulator.js'

const socket = io()

socket.on('connect', () => {
  console.log('Socket.io conectado')
})

socket.on('market_update', (data) => {
  console.log('market_update', data)
})

socket.on('ai_signal', (data) => {
  console.log('ai_signal', data)
})

socket.on('price_alert', (data) => {
  console.log('price_alert', data)
})

// TODO: inicializar modulos y cargar datos iniciales
