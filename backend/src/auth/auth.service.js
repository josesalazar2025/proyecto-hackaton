/**
 * Logica de negocio del modulo de autenticacion.
 *
 * Responsabilidades:
 *   - login({ email, password })  → buscar usuario, comparar hash con bcrypt,
 *     verificar que este activo (isActive) y firmar JWT.
 *   - logout({ jti, exp })        → invalidar el token activo anadiendo su jti
 *     a la denylist en memoria hasta su expiracion original.
 *
 * Seguridad:
 *   - Mensaje generico en fallo de login ("Email or password is incorrect")
 *     para no revelar si el email existe.
 *   - Bcrypt con salt rounds configurable (BCRYPT_ROUNDS, default 10).
 *   - JWT firmado con HS256 y expiracion (JWT_EXPIRES_IN).
 *   - Logout invalida el jti del token; el cliente debe descartar el token.
 *
 * Devuelve:
 *   login  → { token: string, user: { id, email } }
 *   logout → void
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/apiResponse.js';
import { signToken, addToDenylist } from './jwt.js';

const INVALID_CREDENTIALS = new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');

function buildUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    telegramChatId: user.telegramChatId,
    telegramBotToken: user.telegramBotToken,
    telegramAlertsEnabled: user.telegramAlertsEnabled,
  };
}

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw INVALID_CREDENTIALS;

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) throw INVALID_CREDENTIALS;

  const token = signToken({ sub: user.id, email: user.email });

  return {
    token,
    user: buildUserResponse(user),
  };
};

export const register = async ({ email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, 'EMAIL_EXISTS', 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, isActive: true },
  });

  const token = signToken({ sub: user.id, email: user.email });

  return {
    token,
    user: buildUserResponse(user),
  };
};

export const logout = ({ jti, exp }) => {
  if (jti && exp) addToDenylist(jti, exp);
};

export const updateTelegram = async (userId, { telegramBotToken, telegramChatId, telegramAlertsEnabled }) => {
  const data = {};
  if (telegramBotToken !== undefined) data.telegramBotToken = telegramBotToken || null;
  if (telegramChatId !== undefined) data.telegramChatId = telegramChatId || null;
  if (telegramAlertsEnabled !== undefined) data.telegramAlertsEnabled = !!telegramAlertsEnabled;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { user: buildUserResponse(user) }; (Se migró la configuración de alertas Telegram desde una variable de entorno global () hacia campos propios del modelo  en la base de datos. Cada usuario configura su propio bot token, chat ID y activación de alertas desde el panel web.)
};
