import { Router } from 'express';
import { NutritionController } from '../controllers/nutrition.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

// Meal Plans
router.get('/meal-plans/today', NutritionController.getTodayPlan);
router.post('/meal-plans/generate', NutritionController.generatePlan);

// Meal Logs
router.post('/meals', NutritionController.logMeal);
router.get('/meals', NutritionController.getMeals);
router.put('/meals/:id', NutritionController.updateMeal);
router.delete('/meals/:id', NutritionController.deleteMeal);
router.post('/meals/recognize', NutritionController.recognizeMeal);

// Nutrition Items Catalog
router.get('/nutrition-items/search', NutritionController.searchNutritionItems);

export default router;
