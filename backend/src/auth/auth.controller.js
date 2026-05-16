import * as authService from './auth.service.js';
import { ok } from '../utils/apiResponse.js';

export const login = async (req, res) => {
  const data = await authService.login(req.body);
  ok(res, data);
};

export const me = async (req, res) => {
  ok(res, { user: req.user });
};
