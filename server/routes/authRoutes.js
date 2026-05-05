import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/authController.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().notEmpty(),
    handleValidation,
  ],
  login
);

export default router;
