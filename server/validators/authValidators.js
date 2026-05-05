import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  handleValidation,
];
