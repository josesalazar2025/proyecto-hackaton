/**
 * Middleware generico de validacion de inputs con Zod.
 *
 * Responsabilidades:
 *   - Ejecutar schema.safeParse() sobre el source indicado (body, query, params).
 *   - Si falla: propagar HttpError 400 con los errores de validacion detallados.
 *   - Si pasa: reemplazar req[source] por los datos parseados (coercion incluida).
 *
 * Uso tipico:
 *   router.post('/', validate(createBody), controller.create);
 *   router.get('/', validate(listQuery, 'query'), controller.list);
 *   router.get('/:id', validate(idParam, 'params'), controller.getById);
 *
 * Fuente por defecto: 'body'. Para query y params debe especificarse explicitamente.
 */

import { HttpError } from '../utils/apiResponse.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(
      new HttpError(400, 'VALIDATION_ERROR', 'Invalid request', result.error.flatten().fieldErrors),
    );
  }
  // req.query is a getter in Express 5 — override it with a data property
  if (source === 'query') {
    Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
  } else {
    req[source] = result.data;
  }
  next();
};
