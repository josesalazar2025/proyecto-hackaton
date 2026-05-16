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
