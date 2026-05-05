import cors from 'cors';

/**
 * Allows comma-separated origins via CORS_ORIGINS.
 * When unset, all origins are allowed (convenient for local dev only).
 */
export function configureCors() {
  const raw = process.env.CORS_ORIGINS || '';
  const allowedList = raw.split(',').map((s) => s.trim()).filter(Boolean);

  if (process.env.NODE_ENV === 'production' && allowedList.length === 0) {
    console.warn(
      '[security] CORS_ORIGINS is empty in production — any browser origin may call this API. Set CORS_ORIGINS to a comma-separated allowlist.'
    );
  }

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedList.length === 0) {
        return callback(null, true);
      }
      if (allowedList.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });
}
