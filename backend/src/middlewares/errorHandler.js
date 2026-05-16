/**
 * Middleware centralizado de manejo de errores.
 *
 * Responsabilidades:
 *   - Capturar errores lanzados por controladores, servicios o middlewares.
 *   - Si es HttpError conocido: responder con el status y codigo definido.
 *   - Si es error inesperado: loguear el stack y responder 500 generico
 *     ("Internal server error") para no filtrar detalles internos en produccion.
 *
 * Montado al final de app.js como ultimo middleware.
 */

import { HttpError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      ok: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  logger.error({ err, path: req.path, method: req.method }, 'unhandled error');

  return res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
};
