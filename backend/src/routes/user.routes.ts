import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getMe);
router.post('/me/profile', UserController.updateProfile);
router.post('/me/dietary-preferences', UserController.updateDietaryPreferences);
router.get('/me/targets', UserController.getTargets);
router.post('/me/targets/recalculate', UserController.recalculateTargets);
router.delete('/me', UserController.deleteAccount);

export default router;
