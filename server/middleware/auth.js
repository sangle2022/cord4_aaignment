import { verifyAccessToken } from '../utils/token.js';
import { sendError } from '../utils/apiResponse.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401);
  }
  const token = header.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role };
    return next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden', 403);
    }
    return next();
  };
}
