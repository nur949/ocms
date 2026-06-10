import { Router } from 'express';
import { getSalesPersons, createSalesPerson, updateSalesPerson, deleteSalesPerson } from './salesPersons.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['super-admin', 'coordinator', 'sales-executive']), getSalesPersons);
router.post('/', authorize(['super-admin', 'coordinator']), createSalesPerson);
router.put('/:id', authorize(['super-admin', 'coordinator']), updateSalesPerson);
router.delete('/:id', authorize(['super-admin', 'coordinator']), deleteSalesPerson);

export default router;
