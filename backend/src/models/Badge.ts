import { Schema, model, Document } from 'mongoose';

export interface IBadge extends Document {
  code: string;
  title: string;
  description: string;
  iconName: string;
  category: 'workout' | 'nutrition' | 'streak' | 'milestone';
  triggerRule: string;
  points: number;
}

const BadgeSchema = new Schema<IBadge>(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconName: { type: String, default: 'award' },
    category: {
      type: String,
      enum: ['workout', 'nutrition', 'streak', 'milestone'],
      default: 'milestone',
    },
    triggerRule: { type: String, required: true },
    points: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export const Badge = model<IBadge>('Badge', BadgeSchema);
