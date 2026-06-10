import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getRoles, getProfile, updateProfile } from './users.controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);

router.get('/', authorize(['super-admin']), getUsers);
router.get('/roles', authorize(['super-admin']), getRoles);
router.post('/', authorize(['super-admin']), createUser);
router.put('/:id', authorize(['super-admin']), updateUser);
router.delete('/:id', authorize(['super-admin']), deleteUser);

export default router;
