import { Router } from 'express';
import { createVendor, listVendors } from '../controllers/vendorController.js';
import { authenticate } from '../middleware/auth.js';
import { createVendorRules } from '../validators/vendorValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', listVendors);

router.post('/', ...createVendorRules, createVendor);

export default router;
