/**
 * Logica de negocio del modulo de autenticacion.
 *
 * Responsabilidades:
 *   - login({ email, password }) → buscar usuario, comparar hash con bcrypt,
 *     verificar que este activo (isActive) y firmar JWT.
 *
 * Seguridad:
 *   - Mensaje generico en fallo ("Email or password is incorrect")
 *     para no revelar si el email existe.
 *   - Bcrypt con salt rounds configurable (BCRYPT_ROUNDS, default 10).
 *   - JWT firmado con HS256 y expiracion (JWT_EXPIRES_IN).
 *
 * Devuelve:
 *   { token: string, user: { id, email } }
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/apiResponse.js';
import { signToken } from './jwt.js';

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

export const updateTelegram = async (userId, { telegramBotToken, telegramChatId, telegramAlertsEnabled }) => {
  const data = {};
  if (telegramBotToken !== undefined) data.telegramBotToken = telegramBotToken || null;
  if (telegramChatId !== undefined) data.telegramChatId = telegramChatId || null;
  if (telegramAlertsEnabled !== undefined) data.telegramAlertsEnabled = !!telegramAlertsEnabled;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { user: buildUserResponse(user) };
};
