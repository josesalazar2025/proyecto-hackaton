/**
 * Configuración centralizada de variables de entorno.
 *
 * Carga los valores de process.env con defaults seguros para desarrollo.
 * Expone constantes como: PORT, DATABASE_URL, HF_TOKEN, FINNHUB_API_KEY,
 * OPENROUTER_API_KEY, TELEGRAM_BOT_TOKEN, NODE_ENV.
 *
 * Evita dispersar process.env por todo el código.
 */
