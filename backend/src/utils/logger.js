/**
 * Logger estructurado basado en Pino.
 *
 * Responsabilidades:
 *   - Loguear eventos del servidor en formato JSON (facil de parsear).
 *   - Nivel configurable via LOG_LEVEL (trace, debug, info, warn, error, fatal).
 *   - Usado por todos los modulos para trazabilidad sin bloquear el event loop.
 *
 * En produccion se puede redirigir stdout a un agregador de logs (Datadog, etc.).
 */

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});
