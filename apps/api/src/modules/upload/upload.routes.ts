import { Router } from 'express';
import { uploadImage } from './upload.controller';
import { authenticate } from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';

const router = Router();

router.post('/', authenticate, upload.single('image'), uploadImage);

export default router;
