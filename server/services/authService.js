import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { HttpError } from '../utils/HttpError.js';
import { signAccessToken } from '../utils/token.js';

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
}
