import { Router } from 'express';
import {
  approvePayout,
  createPayout,
  getPayoutById,
  listPayouts,
  rejectPayout,
  submitPayout,
} from '../controllers/payoutController.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import {
  createPayoutRules,
  listPayoutsQueryRules,
  payoutIdParamRules,
  rejectPayoutRules,
} from '../validators/payoutValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', ...listPayoutsQueryRules, listPayouts);

router.post('/', requireRoles(['OPS']), ...createPayoutRules, createPayout);

router.get('/:id', ...payoutIdParamRules, getPayoutById);

router.post('/:id/submit', requireRoles(['OPS']), ...payoutIdParamRules, submitPayout);

router.post('/:id/approve', requireRoles(['FINANCE']), ...payoutIdParamRules, approvePayout);

router.post('/:id/reject', requireRoles(['FINANCE']), ...rejectPayoutRules, rejectPayout);

export default router;
