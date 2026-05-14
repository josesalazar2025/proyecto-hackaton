/**
 * Pipeline de inteligencia artificial para generación de señales.
 *
 * Flujo de dos fases:
 *   1. ModernFinBERT (HF Inference API) → filtra noticias con label=neutral o score<0.65
 *   2. Qwen3-8B (HF Inference API)      → analiza mercado + noticias filtradas y genera:
 *        { signal, confidence, summary, keyRisk }
 *
 * Fallback: si HF está saturado, usa OpenRouter con deepseek/deepseek-v4-flash.
 *
 * Persiste el resultado en la tabla AISignal y emite evento 'ai_signal' por Socket.io.
 */
