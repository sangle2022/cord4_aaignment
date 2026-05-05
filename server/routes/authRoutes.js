import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { loginLimiter } from '../middleware/rateLimits.js';
import { loginRules } from '../validators/authValidators.js';

const router = Router();

router.post('/login', loginLimiter, ...loginRules, login);

export default router;
