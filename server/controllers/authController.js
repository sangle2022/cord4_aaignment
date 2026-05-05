import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { signAccessToken } from '../utils/token.js';

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return sendError(res, 'Invalid credentials', 401);
  }
  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  return sendSuccess(res, {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  });
}
