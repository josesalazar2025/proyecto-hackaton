/**
 * Configuracion centralizada de variables de entorno.
 *
 * Carga los valores de process.env mediante dotenv, los valida con Zod
 * y expone constantes tipadas como: PORT, DATABASE_URL, JWT_SECRET,
 * HF_TOKEN, HF_SPACE_MODERNFINBERT_URL, HF_SPACE_QWEN_URL, etc.
 *
 * Variables clave:
 *   - PORT: 7860 (requerido por HuggingFace Spaces).
 *   - DATABASE_URL: SQLite local para desarrollo, PostgreSQL para produccion.
 *   - JWT_SECRET: minimo 32 caracteres, usado para firmar tokens de autenticacion.
 *   - HF_TOKEN / HF_SPACE_*: credenciales para los Spaces de HuggingFace (IA).
 *   - OPENROUTER_API_KEY: fallback LLM si los Spaces estan saturados.
 *   - FINNHUB_API_KEY: noticias financieras para el pipeline de senales.
 *   - TELEGRAM_BOT_TOKEN: bot de alertas (@BotFather).
 *
 * Si falla la validacion, el proceso termina con error antes de levantar el servidor.
 */

import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(7860),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  HF_TOKEN: z.string().optional(),
  HF_SPACE_MODERNFINBERT_URL: z.string().optional(),
  HF_SPACE_QWEN_URL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  FINNHUB_API_KEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
