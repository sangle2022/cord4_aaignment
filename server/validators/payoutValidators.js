import { body, param, query } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { PAYOUT_MODES, PAYOUT_STATUSES } from '../models/Payout.js';

export const listPayoutsQueryRules = [
  query('status').optional().isIn(PAYOUT_STATUSES),
  handleValidation,
];

export const createPayoutRules = [
  body('vendor_id').isMongoId(),
  body('amount')
    .toFloat()
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than 0'),
  body('mode').isIn(PAYOUT_MODES),
  body('note').optional().isString(),
  handleValidation,
];

export const payoutIdParamRules = [param('id').isMongoId(), handleValidation];

export const rejectPayoutRules = [
  param('id').isMongoId(),
  body('reason').isString().trim().notEmpty().withMessage('Rejection reason is required'),
  handleValidation,
];
