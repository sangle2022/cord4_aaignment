import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email, req.body.password);
  return sendSuccess(res, data);
});
