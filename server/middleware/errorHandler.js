import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message || 'Request failed';
  return sendError(res, message, status, err.details);
}
