const defaults = {
  mode: 'auto',          // 'auto' | 'external' | 'local' | 'custom'
  provider: 'deepseek',  // for external: 'deepseek' | 'openrouter' | 'huggingface'
  apiKey: '',
  endpoint: 'http://localhost:11434',
  model: 'qwen3:8b',
};

let _prefs = { ...defaults };

export function getPrefs() {
  return { ..._prefs };
}

export function setPrefs(updates) {
  const allowed = ['mode', 'provider', 'apiKey', 'endpoint', 'model'];
  for (const key of allowed) {
    if (key in updates && updates[key] != null) {
      _prefs[key] = String(updates[key]);
    }
  }
  if (!['auto', 'external', 'local', 'custom'].includes(_prefs.mode)) _prefs.mode = 'auto';
  if (!['deepseek', 'openrouter', 'huggingface'].includes(_prefs.provider)) _prefs.provider = 'deepseek';
  return { ..._prefs };
}
