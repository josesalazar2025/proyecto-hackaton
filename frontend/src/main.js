/**
 * Entry point de la aplicacion frontend (SPA Vanilla JS + Vite).
 *
 * Responsabilidades:
 *   - Importar hojas de estilo globales (style.css).
 *   - Lanzar la inicializacion de la aplicacion (app.js → init()).
 *   - Capturar errores de arranque en consola.
 *
 * Entorno:
 *   - Bundler: Vite 7+ (dev server en :5173, proxy a backend en :7860).
 *   - Build de produccion: genera /dist servido como estatico por Express.
 */

import './style.css'
import { init } from './app.js'

init().catch((err) => console.error('Failed to initialize app:', err))
