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

/**
 * Escapa caracteres especiales HTML para evitar inyeccion
 * cuando se usa parse_mode='HTML' en la API de Telegram.
 *
 * @param {string} text - Texto a escapar.
 * @returns {string} Texto con entidades HTML escapadas (&, <, >, ").
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Formatea un mensaje de alerta de precio en HTML para Telegram.
 *
 * Escapa automaticamente la pregunta del mercado para evitar inyeccion HTML.
 * Los tags <b> son intencionales y no se escapan.
 *
 * @param {string} question - Pregunta del mercado (se escapa automaticamente).
 * @param {number} yesPrice - Precio YES actual (0-1).
 * @param {number} threshold - Umbral que se cruzo (0-1).
 * @returns {string} Mensaje formateado en HTML.
 */
export function formatPriceAlert(question, yesPrice, threshold) {
  const safeQuestion = escapeHtml(question);
  const pct = (yesPrice * 100).toFixed(1);
  const thr = (threshold * 100).toFixed(1);
  return `<b>Price Alert</b>\n${safeQuestion}\nYES: ${pct}% ≥ threshold ${thr}%`;
}

/**
 * Envia un mensaje de texto a un chat de Telegram via Bot API.
 *
 * Si TELEGRAM_BOT_TOKEN no esta configurado o chatId es falsy, la funcion
 * retorna silenciosamente sin realizar peticion.
 *
 * Ante errores de red o respuestas con ok: false de Telegram, se loguea un
 * warning y la funcion retorna sin lanzar excepcion, evitando interrumpir
 * el flujo del scheduler.
 *
 * @param {string|number} chatId - Identificador del chat de Telegram.
 * @param {string} text - Texto del mensaje (debe estar ya formateado en HTML).
 * @returns {Promise<void>}
 */
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
