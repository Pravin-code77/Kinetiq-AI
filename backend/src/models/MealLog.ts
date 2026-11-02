import { Schema, model, Document, Types } from 'mongoose';

export interface ILoggedFoodItem {
  name: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface IMealLog extends Document {
  userId: Types.ObjectId;
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  items: ILoggedFoodItem[];
  photoUrl?: string;
  loggedAt: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
  updatedAt: Date;
}

const LoggedFoodItemSchema = new Schema<ILoggedFoodItem>(
  {
    name: { type: String, required: true },
    portionGrams: { type: Number, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { _id: false }
);

const MealLogSchema = new Schema<IMealLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mealSlot: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: true,
    },
    items: [LoggedFoodItemSchema],
    photoUrl: { type: String, default: '' },
    loggedAt: { type: Date, default: Date.now, index: true },
    totalCalories: { type: Number, required: true },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MealLogSchema.index({ userId: 1, loggedAt: -1 });

export const MealLog = model<IMealLog>('MealLog', MealLogSchema);
