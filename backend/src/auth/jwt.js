import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const signToken = (payload) =>
  jwt.sign(payload, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  });

export const verifyToken = (token) =>
  jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
