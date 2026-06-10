import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.get('/', authenticate, getSettings);
router.post('/', authenticate, authorize(['super-admin']), updateSettings);

export default router;
