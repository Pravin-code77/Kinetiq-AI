import { Schema, model, Document, Types } from 'mongoose';

export interface IDietaryPreference extends Document {
  userId: Types.ObjectId;
  dietType: 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Balanced' | 'High Protein' | 'Low Carb' | 'Keto';
  allergies: string[];
  medicalFlags: string[];
  disclaimerAcknowledgedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DietaryPreferenceSchema = new Schema<IDietaryPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    dietType: {
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Balanced', 'High Protein', 'Low Carb', 'Keto'],
      default: 'Balanced',
      required: true,
    },
    allergies: { type: [String], default: [] },
    medicalFlags: { type: [String], default: [] },
    disclaimerAcknowledgedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const DietaryPreference = model<IDietaryPreference>('DietaryPreference', DietaryPreferenceSchema);
