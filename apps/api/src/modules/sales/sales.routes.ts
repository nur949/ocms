import { Router } from 'express';
import { getSales, createSale, updateSale, deleteSale } from './sales.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['super-admin', 'coordinator', 'sales-executive']), getSales);
router.post('/', authorize(['super-admin', 'coordinator', 'sales-executive']), createSale);
router.put('/:id', authorize(['super-admin', 'coordinator']), updateSale);
router.delete('/:id', authorize(['super-admin', 'coordinator']), deleteSale);

export default router;
