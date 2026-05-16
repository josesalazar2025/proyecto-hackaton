/**
 * Logica de negocio del modulo de alertas.
 *
 * Responsabilidades:
 *   - list(userId, query) → devuelve alertas paginadas del usuario.
 *   - processAll()        → revisa la watchlist cada 60s (scheduler):
 *       1. Obtiene entradas de watchlist con alertThreshold.
 *       2. Si yesPrice >= alertThreshold y no hay alerta reciente (5 min dedup):
 *          - Crea alerta en base de datos.
 *          - Envía mensaje por Telegram (si hay bot token y chatId).
 *          - Emite evento 'price_alert' por Socket.io.
 *
 * Tipos de alerta:
 *   - price_threshold : umbral de precio cruzado.
 *   - signal_change   : cambio de senal IA (reservado para futuras versiones).
 *
 * Consumido por:
 *   - alerts.controller.js (API REST).
 *   - scheduler.js (processAlerts cada 60s).
 */

import { z } from 'zod';
import { alertsRepository } from './alerts.repository.js';
import { watchlistRepository } from '../watchlist/watchlist.repository.js';
import { sendMessage } from './telegram.client.js';
import { emitPriceAlert } from '../socket/broadcaster.js';
import { logger } from '../utils/logger.js';

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 min

export const alertsService = {
  list(userId, query) {
    const { limit, offset } = listQuery.parse(query);
    return alertsRepository.findByUser(userId, { limit, offset });
  },

  async processAll() {
    const entries = await watchlistRepository.findAllWithThreshold();

    for (const entry of entries) {
      const { alertThreshold, user, market } = entry;
      if (!market.yesPrice || market.yesPrice < alertThreshold) continue;

      const recent = await alertsRepository.findRecent(user.id, market.id, 'price_threshold', DEDUP_WINDOW_MS);
      if (recent) continue;

      const pct = (market.yesPrice * 100).toFixed(1);
      const threshold = (alertThreshold * 100).toFixed(1);
      const message =
        `<b>Price Alert</b>\n${market.question}\nYES: ${pct}% ≥ threshold ${threshold}%`;

      await alertsRepository.create({ userId: user.id, marketId: market.id, type: 'price_threshold', message });
      await sendMessage(user.telegramChatId, message);
      emitPriceAlert({ marketId: market.id, type: 'price_threshold', message });
      logger.info({ marketId: market.id, userId: user.id }, 'price alert sent');
    }
  },
};
