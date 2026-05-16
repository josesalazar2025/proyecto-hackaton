import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/apiResponse.js';
import { signToken } from './jwt.js';

const INVALID_CREDENTIALS = new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw INVALID_CREDENTIALS;

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) throw INVALID_CREDENTIALS;

  const token = signToken({ sub: user.id, email: user.email });

  return {
    token,
    user: { id: user.id, email: user.email },
  };
};
