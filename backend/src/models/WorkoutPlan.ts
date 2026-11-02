import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkoutPlan extends Document {
  userId: Types.ObjectId;
  weekStartDate: Date;
  splitType: 'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs';
  goal: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Recomposition' | 'Endurance';
  status: 'active' | 'completed' | 'archived';
  sessions: Types.ObjectId[];
  explanation: string;
  isCustom?: boolean;
  customName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekStartDate: { type: Date, default: Date.now, index: true },
    splitType: {
      type: String,
      enum: ['Full Body', 'Upper/Lower', 'Push/Pull/Legs'],
      required: true,
    },
    goal: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Recomposition', 'Endurance'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    sessions: [{ type: Schema.Types.ObjectId, ref: 'WorkoutSession' }],
    explanation: { type: String, default: '' },
    isCustom: { type: Boolean, default: false },
    customName: { type: String, default: '' },
  },
  { timestamps: true }
);

export const WorkoutPlan = model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
