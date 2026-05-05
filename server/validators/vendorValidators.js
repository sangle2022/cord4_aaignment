import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';

export const createVendorRules = [
  body('name').isString().trim().notEmpty(),
  body('upi_id').optional().isString(),
  body('bank_account').optional().isString(),
  body('ifsc').optional().isString(),
  body('is_active').optional().isBoolean(),
  handleValidation,
];
