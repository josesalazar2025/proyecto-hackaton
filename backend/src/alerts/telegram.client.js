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
