import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000;

export const apiLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_MAX) || 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});

export const loginLimiter = rateLimit({
  windowMs,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { success: false, message: 'Too many login attempts. Please wait and try again.' },
});
