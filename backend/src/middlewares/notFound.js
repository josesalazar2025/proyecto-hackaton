/**
 * Middleware para rutas no definidas (404).
 *
 * Responsabilidades:
 *   - Responder con 404 y un JSON estandarizado cuando ninguna ruta coincide.
 *   - Incluye el metodo y path solicitado para facilitar debugging.
 *
 * Montado al final de app.js, justo antes del errorHandler.
 */

export const notFound = (req, res) =>
  res.status(404).json({
    ok: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
