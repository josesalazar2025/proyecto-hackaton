import { verifyToken } from '../auth/jwt.js';
import { prisma } from '../utils/prisma.js';
import { HttpError } from '../utils/apiResponse.js';

const UNAUTHORIZED = new HttpError(401, 'UNAUTHORIZED', 'Authentication required');

export const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw UNAUTHORIZED;

    const token = header.slice('Bearer '.length).trim();
    if (!token) throw UNAUTHORIZED;

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, isActive: true, createdAt: true },
    });

    if (!user || !user.isActive) throw UNAUTHORIZED;

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(UNAUTHORIZED);
  }
};
