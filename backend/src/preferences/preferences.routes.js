import { Router } from 'express';
import { getPrefs, setPrefs } from './preferences.store.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();

router.get('/', (_req, res) => {
  const prefs = getPrefs();
  ok(res, { ...prefs, apiKey: prefs.apiKey ? '***' : '' });
});

router.put('/', (req, res) => {
  const { mode, provider, apiKey, endpoint, model } = req.body;
  const updated = setPrefs({ mode, provider, apiKey, endpoint, model });
  ok(res, { ...updated, apiKey: updated.apiKey ? '***' : '' });
});

export default router;
