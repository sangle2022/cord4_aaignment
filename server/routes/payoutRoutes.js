import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  approvePayout,
  createPayout,
  getPayoutById,
  listPayouts,
  rejectPayout,
  submitPayout,
} from '../controllers/payoutController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { PAYOUT_MODES, PAYOUT_STATUSES } from '../models/Payout.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  [query('status').optional().isIn(PAYOUT_STATUSES), handleValidation],
  listPayouts
);

router.post(
  '/',
  requireRoles(['OPS']),
  [
    body('vendor_id').isMongoId(),
    body('amount')
      .toFloat()
      .custom((value) => value > 0)
      .withMessage('Amount must be greater than 0'),
    body('mode').isIn(PAYOUT_MODES),
    body('note').optional().isString(),
    handleValidation,
  ],
  createPayout
);

router.get(
  '/:id',
  [param('id').isMongoId(), handleValidation],
  getPayoutById
);

router.post(
  '/:id/submit',
  requireRoles(['OPS']),
  [param('id').isMongoId(), handleValidation],
  submitPayout
);

router.post(
  '/:id/approve',
  requireRoles(['FINANCE']),
  [param('id').isMongoId(), handleValidation],
  approvePayout
);

router.post(
  '/:id/reject',
  requireRoles(['FINANCE']),
  [
    param('id').isMongoId(),
    body('reason').isString().trim().notEmpty().withMessage('Rejection reason is required'),
    handleValidation,
  ],
  rejectPayout
);

export default router;
