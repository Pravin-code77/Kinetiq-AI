import { Schema, model, Document, Types } from 'mongoose';

export interface IUserTarget extends Document {
  userId: Types.ObjectId;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserTargetSchema = new Schema<IUserTarget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bmr: { type: Number, required: true },
    tdee: { type: Number, required: true },
    calorieTarget: { type: Number, required: true },
    proteinGrams: { type: Number, required: true },
    carbsGrams: { type: Number, required: true },
    fatGrams: { type: Number, required: true },
    effectiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserTarget = model<IUserTarget>('UserTarget', UserTargetSchema);
