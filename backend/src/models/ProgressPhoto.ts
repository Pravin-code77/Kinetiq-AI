import { Schema, model, Document, Types } from 'mongoose';

export interface IProgressPhoto extends Document {
  userId: Types.ObjectId;
  photoUrl: string;
  angle: 'front' | 'side' | 'back';
  takenAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressPhotoSchema = new Schema<IProgressPhoto>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    photoUrl: { type: String, required: true },
    angle: {
      type: String,
      enum: ['front', 'side', 'back'],
      default: 'front',
      required: true,
    },
    takenAt: { type: Date, default: Date.now, index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ProgressPhotoSchema.index({ userId: 1, angle: 1, takenAt: -1 });

export const ProgressPhoto = model<IProgressPhoto>('ProgressPhoto', ProgressPhotoSchema);
