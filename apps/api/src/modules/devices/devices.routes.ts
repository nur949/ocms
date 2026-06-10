import { Router } from 'express';
import { getDevices, createDevice, updateDevice, deleteDevice } from './devices.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['super-admin', 'coordinator', 'sales-executive']), getDevices);
router.post('/', authorize(['super-admin', 'coordinator']), createDevice);
router.put('/:id', authorize(['super-admin', 'coordinator']), updateDevice);
router.delete('/:id', authorize(['super-admin']), deleteDevice);

export default router;
