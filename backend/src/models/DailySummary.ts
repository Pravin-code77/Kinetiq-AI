import { Schema, model, Document, Types } from 'mongoose';

export interface IDailySummary extends Document {
  userId: Types.ObjectId;
  summaryDate: string; // YYYY-MM-DD
  workoutsCompleted: number;
  workoutsPlanned: number;
  caloriesIn: number;
  calorieTarget: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    summaryDate: { type: String, required: true, index: true },
    workoutsCompleted: { type: Number, default: 0 },
    workoutsPlanned: { type: Number, default: 0 },
    caloriesIn: { type: Number, default: 0 },
    calorieTarget: { type: Number, default: 2000 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailySummarySchema.index({ userId: 1, summaryDate: 1 }, { unique: true });

export const DailySummary = model<IDailySummary>('DailySummary', DailySummarySchema);
