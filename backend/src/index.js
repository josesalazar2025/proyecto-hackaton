import http from 'node:http';
import app from './app.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { prisma } from './utils/prisma.js';

const httpServer = http.createServer(app);

httpServer.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'PolySignal backend up');
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    logger.info({ sig }, 'shutting down');
    httpServer.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}
