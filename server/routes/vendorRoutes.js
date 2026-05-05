import { Router } from 'express';
import { body } from 'express-validator';
import { createVendor, listVendors } from '../controllers/vendorController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', listVendors);

router.post(
  '/',
  [
    body('name').isString().trim().notEmpty(),
    body('upi_id').optional().isString(),
    body('bank_account').optional().isString(),
    body('ifsc').optional().isString(),
    body('is_active').optional().isBoolean(),
    handleValidation,
  ],
  createVendor
);

export default router;
