/**
 * Cliente de integracion con Telegram Bot API.
 *
 * Responsabilidades:
 *   - sendMessage(chatId, text) → POST a api.telegram.org/bot<TOKEN>/sendMessage.
 *   - formatPriceAlert(question, yesPrice, threshold) → construye mensaje HTML
 *     escapando entidades del input de usuario.
 *   - escapeHtml(text) → escapa caracteres HTML sensibles (&, <, >, ").
 *   - Parse_mode: HTML (permite formato basico: <b>, <i>).
 *   - Si falta TELEGRAM_BOT_TOKEN o chatId, sendMessage retorna silenciosamente.
 *   - Errores de red se capturan y loguean como warn (no bloquean el flujo).
 *   - Respuestas de Telegram con ok: false se loguean como warn y no lanzan excepcion.
 *
 * Consumido por:
 *   - alerts.service.js → processAll() cuando se dispara una alerta.
 *
 * Seguridad:
 *   - El token se lee de variables de entorno (nunca hardcodeado).
 *   - Todo texto dinamico se escapa via escapeHtml antes de inyectarse en HTML.
 */

import { httpPost } from '../utils/httpClient.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export function escapeHtml(text) {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatPriceAlert(question, yesPrice, threshold) {
  const safeQuestion = escapeHtml(question);
  const pct = (yesPrice * 100).toFixed(1);
  const thr = (threshold * 100).toFixed(1);
  return `<b>Price Alert</b>\n${safeQuestion}\nYES: ${pct}% ≥ threshold ${thr}%`;
}

export async function sendMessage(chatId, text) {
  if (!config.TELEGRAM_BOT_TOKEN || !chatId) return;
  try {
    const result = await httpPost(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML' },
      { retries: 1, timeout: 8_000 },
    );
    if (result && result.ok === false) {
      logger.warn(
        { chatId, description: result.description, errorCode: result.error_code },
        'telegram API returned ok=false',
      );
      return;
    }
  } catch (err) {
    logger.warn({ err: err.message, chatId }, 'telegram send failed');
  }
}
