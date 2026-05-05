import mongoose from 'mongoose';
import { sendError } from '../utils/apiResponse.js';
import { HttpError } from '../utils/HttpError.js';

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Request failed';
  let details = err.details;

  if (err instanceof HttpError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid identifier format';
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err.code === 11000) {
    status = 409;
    message = 'A record with this value already exists';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  }

  if (!Number.isInteger(status) || status < 400 || status > 599) {
    status = 500;
  }

  if (status >= 500) {
    if (isProduction()) {
      console.error('[server]', req.method, req.originalUrl, err.message);
    } else {
      console.error('[server]', req.method, req.originalUrl, err);
    }
    message = 'Internal server error';
    details = undefined;
  }

  return sendError(res, message, status, details);
}
