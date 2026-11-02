import { Schema, model, Document, Types } from 'mongoose';

export interface IPlannedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  recipeId?: Types.ObjectId;
  name: string;
  portionScale: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl?: string;
}

export interface IMealPlan extends Document {
  userId: Types.ObjectId;
  planDate: Date;
  meals: IPlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlannedMealSchema = new Schema<IPlannedMeal>(
  {
    slot: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: true,
    },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    name: { type: String, required: true },
    portionScale: { type: Number, default: 1.0 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fat: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planDate: { type: Date, required: true, index: true },
    meals: [PlannedMealSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for querying user plan by date
MealPlanSchema.index({ userId: 1, planDate: 1 });

export const MealPlan = model<IMealPlan>('MealPlan', MealPlanSchema);
