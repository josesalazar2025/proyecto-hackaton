/**
 * Entry point de la aplicacion PolySignal.
 *
 * Inicializa el servidor Express, configura Socket.io para comunicacion en tiempo real,
 * sirve los archivos estaticos del frontend desde ../frontend/, monta las rutas REST
 * bajo /api/v1/* y arranca el scheduler de node-cron.
 *
 * Puerto por defecto: 7860 (requerido por HuggingFace Spaces).
 */
