import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import workoutRoutes from './workout.routes';
import nutritionRoutes from './nutrition.routes';
import progressRoutes from './progress.routes';
import dashboardRoutes from './dashboard.routes';
import gamificationRoutes from './gamification.routes';
import notificationRoutes from './notification.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/workouts', workoutRoutes);
apiRouter.use('/', nutritionRoutes); // exposes /meal-plans, /meals, /nutrition-items
apiRouter.use('/progress', progressRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/gamification', gamificationRoutes);
apiRouter.use('/notifications', notificationRoutes);

export default apiRouter;
