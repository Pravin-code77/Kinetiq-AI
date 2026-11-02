import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.post('/weight', ProgressController.logWeight);
router.get('/weight', ProgressController.getWeightHistory);
router.post('/photos', ProgressController.uploadPhoto);
router.get('/photos', ProgressController.getPhotos);

export default router;
