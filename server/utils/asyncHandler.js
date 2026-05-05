import { sendError } from './apiResponse.js';
import { HttpError } from './HttpError.js';

export function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      if (err instanceof HttpError) {
        return sendError(res, err.message, err.statusCode);
      }
      return next(err);
    }
  };
}
