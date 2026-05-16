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
