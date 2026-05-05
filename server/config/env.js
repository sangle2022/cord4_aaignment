/**
 * Validates required environment variables before the server binds.
 */
export function validateEnv() {
  const errors = [];
  if (!process.env.MONGO_URI || !process.env.MONGO_URI.trim()) {
    errors.push('MONGO_URI is required');
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.trim().length < 16) {
    errors.push('JWT_SECRET must be set and at least 16 characters');
  }
  if (process.env.NODE_ENV === 'production') {
    if (!jwtSecret || jwtSecret.trim().length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
  }
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n- ${errors.join('\n- ')}`);
  }
}
