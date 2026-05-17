/**
 * Entry point de la aplicacion PolySignal.
 *
 * Inicializa el servidor HTTP nativo de Node.js, monta Express sobre el,
 * configura Socket.io para comunicacion en tiempo real, arranca el scheduler
 * de tareas periodicas (node-cron) y gestiona el cierre limpio ante SIGTERM/SIGINT.
 *
 * Flujo de arranque:
 *   1. Crear servidor HTTP y adjuntar Express (app.js).
 *   2. Inicializar Socket.io con CORS permitido desde CORS_ORIGIN.
 *   3. Conectar el broadcaster (socket/broadcaster.js) para emitir eventos.
 *   4. Escuchar en el puerto configurado (default 7860 para HF Spaces).
 *   5. En modo no-test, iniciar scheduler (sync mercados, senales IA, PnL, alertas).
 *
 * Puerto por defecto: 7860 (requerido por HuggingFace Spaces).
 */

import http from 'node:http';
import { Server as IOServer } from 'socket.io';
import app from './app.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { prisma } from './utils/prisma.js';
import { attachBroadcaster } from './socket/broadcaster.js';
import { startScheduler } from './scheduler.js';

const httpServer = http.createServer(app);
const io = new IOServer(httpServer, { cors: { origin: config.CORS_ORIGIN } });
attachBroadcaster(io);

httpServer.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'PolySignal backend up');
});

if (config.NODE_ENV !== 'test') {
  startScheduler();
}

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    logger.info({ sig }, 'shutting down');
    httpServer.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
