import { logger } from './logger.js';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function backoff(attempt) {
  return Math.min(1_000 * 2 ** attempt, 30_000);
}

async function request(url, init = {}, { timeout = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...init,
        headers: { 'User-Agent': 'PolySignal/1.0', ...init.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (RETRYABLE_STATUSES.has(res.status) && attempt < retries) {
        const wait = backoff(attempt);
        logger.warn({ url, status: res.status, attempt, wait }, 'retrying request');
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const err = Object.assign(new Error(`HTTP ${res.status} — ${url}`), {
          status: res.status,
          body: data,
        });
        throw err;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw Object.assign(new Error(`Timeout after ${timeout}ms — ${url}`), { code: 'TIMEOUT' });
      }

      // network error (no HTTP status) → retry
      if (!err.status && attempt < retries) {
        const wait = backoff(attempt);
        logger.warn({ url, err: err.message, attempt, wait }, 'network error, retrying');
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      logger.error({ url, err: err.message }, 'request failed');
      throw err;
    }
  }
}

export const httpGet = (url, { headers, ...opts } = {}) =>
  request(url, { method: 'GET', headers }, opts);

export const httpPost = (url, body, { headers, ...opts } = {}) =>
  request(
    url,
    { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) },
    opts,
  );
