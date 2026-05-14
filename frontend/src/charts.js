/**
 * Módulo de gráficos de historial de precios.
 *
 * Tecnología: Chart.js
 *
 * Funciones:
 *   - Renderizar línea de precios YES/NO de un mercado seleccionado
 *   - Actualizar datos en tiempo real cuando llega 'market_update'
 *   - Opcional: mostrar punto de entrada de posiciones abiertas
 *
 * Se vincula al panel de detalle de mercado.
 */

import { Chart } from 'chart.js/auto'
