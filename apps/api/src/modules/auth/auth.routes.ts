import { Router } from 'express';
import { login, refresh, logout } from './auth.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

export default router;
