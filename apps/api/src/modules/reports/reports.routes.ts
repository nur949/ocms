import { Router } from 'express';
import { getDashboardStats } from './reports.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize(['super-admin', 'coordinator', 'sales-executive']), getDashboardStats);

export default router;
