/**
 * Esquemas Zod para validar inputs del modulo de autenticacion.
 *
 * Responsabilidades:
 *   - loginSchema: validar email (formato correcto, lowercase, trim)
 *                  y password (minimo 8 caracteres).
 *
 * Consumido por:
 *   - auth.routes.js → validate(loginSchema) en POST /login.
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
