import { Router } from 'express';
import { getEngineers, createEngineer, updateEngineer, deleteEngineer } from './engineers.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['super-admin', 'coordinator', 'sales-executive']), getEngineers);
router.post('/', authorize(['super-admin', 'coordinator']), createEngineer);
router.put('/:id', authorize(['super-admin', 'coordinator']), updateEngineer);
router.delete('/:id', authorize(['super-admin']), deleteEngineer);

export default router;
