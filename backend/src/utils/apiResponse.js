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
