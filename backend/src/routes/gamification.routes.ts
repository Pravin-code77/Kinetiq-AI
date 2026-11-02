import { Router } from 'express';
import { GamificationController } from '../controllers/gamification.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/streak', GamificationController.getStreak);
router.get('/badges', GamificationController.getBadges);

export default router;
