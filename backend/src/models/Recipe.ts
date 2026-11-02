import { Schema, model, Document } from 'mongoose';

export interface IIngredient {
  name: string;
  amount: string;
  calories?: number;
}

export interface IRecipe extends Document {
  name: string;
  description: string;
  dietType: 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Balanced' | 'High Protein' | 'Low Carb' | 'Keto';
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  ingredients: IIngredient[];
  preparationInstructions: string[];
  preparationTime: number; // minutes
  servings: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl: string;
  allergens: string[];
}

const IngredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true },
    amount: { type: String, required: true },
    calories: { type: Number, default: 0 },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    dietType: {
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Balanced', 'High Protein', 'Low Carb', 'Keto'],
      required: true,
      index: true,
    },
    mealSlot: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      required: true,
      index: true,
    },
    ingredients: [IngredientSchema],
    preparationInstructions: { type: [String], default: [] },
    preparationTime: { type: Number, default: 20 },
    servings: { type: Number, default: 1 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fat: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    allergens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Recipe = model<IRecipe>('Recipe', RecipeSchema);
