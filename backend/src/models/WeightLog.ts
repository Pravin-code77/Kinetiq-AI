import { Schema, model, Document, Types } from 'mongoose';

export interface IWeightLog extends Document {
  userId: Types.ObjectId;
  weightKg: number;
  loggedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeightLogSchema = new Schema<IWeightLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weightKg: { type: Number, required: true },
    loggedAt: { type: Date, default: Date.now, index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

WeightLogSchema.index({ userId: 1, loggedAt: -1 });

export const WeightLog = model<IWeightLog>('WeightLog', WeightLogSchema);
