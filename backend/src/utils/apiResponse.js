/**
 * Helpers para respuestas HTTP estandarizadas y manejo de errores.
 *
 * Funciones de respuesta exitosa:
 *   - ok(res, data, meta)      → 200 con { ok: true, data } y meta opcional.
 *   - created(res, data)       → 201 con { ok: true, data }.
 *   - noContent(res)           → 204 sin body.
 *
 * Clase HttpError:
 *   - Extiende Error nativo.
 *   - Campos: status (HTTP), code (string identificador), message, details (opcional).
 *   - Usada por middlewares y servicios para propagar errores controlados.
 */

export const ok = (res, data, meta) =>
  res.status(200).json(meta ? { ok: true, data, meta } : { ok: true, data });

export const created = (res, data) => res.status(201).json({ ok: true, data });

export const noContent = (res) => res.status(204).end();

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
