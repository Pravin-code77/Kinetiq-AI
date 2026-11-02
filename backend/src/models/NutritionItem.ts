import { Schema, model, Document } from 'mongoose';

export interface INutritionItem extends Document {
  name: string;
  category: 'Protein' | 'Carbohydrate' | 'Vegetable' | 'Fruit' | 'Dairy' | 'Fat' | 'Snack' | 'Beverage';
  caloriesPer100g: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl?: string;
  source: 'Curated' | 'User' | 'USDA';
}

const NutritionItemSchema = new Schema<INutritionItem>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: ['Protein', 'Carbohydrate', 'Vegetable', 'Fruit', 'Dairy', 'Fat', 'Snack', 'Beverage'],
      required: true,
      index: true,
    },
    caloriesPer100g: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fat: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    source: { type: String, enum: ['Curated', 'User', 'USDA'], default: 'Curated' },
  },
  { timestamps: true }
);

export const NutritionItem = model<INutritionItem>('NutritionItem', NutritionItemSchema);
