import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/plan/current', WorkoutController.getCurrentPlan);
router.post('/plan/generate', WorkoutController.generatePlan);
router.post('/plan/custom', WorkoutController.createCustomPlan);
router.get('/exercises', WorkoutController.getExercises);
router.get('/exercises/:id', WorkoutController.getExerciseById);
router.post('/sessions/:sessionId/log', WorkoutController.logSession);
router.get('/history', WorkoutController.getHistory);

export default router;
