/**
 * Servicio de envio de alertas por Telegram Bot API.
 *
 * Responsabilidades:
 *   - sendMessage(chatId, text) → POST a api.telegram.org/bot<TOKEN>/sendMessage.
 *   - Parse_mode: HTML (permite formato basico: <b>, <i>).
 *   - Si falta TELEGRAM_BOT_TOKEN o chatId, la funcion retorna silenciosamente.
 *   - Errores de red se capturan y loguean como warn (no bloquean el flujo).
 *
 * Consumido por:
 *   - alerts.service.js → processAll() cuando se dispara una alerta.
 *
 * Seguridad:
 *   - El token se lee de variables de entorno (nunca hardcodeado).
 *   - Se recomienda escapar entidades HTML si el texto incluye input de usuario.
 */

import { httpPost } from '../utils/httpClient.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export async function sendMessage(chatId, text) {
  if (!config.TELEGRAM_BOT_TOKEN || !chatId) return;
  try {
    await httpPost(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML' },
      { retries: 1, timeout: 8_000 },
    );
  } catch (err) {
    logger.warn({ err: err.message, chatId }, 'telegram send failed');
  }
}
