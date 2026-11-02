import { Schema, model, Document, Types } from 'mongoose';

export interface ISessionExercise {
  exerciseId: Types.ObjectId;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  order: number;
}

export interface IWorkoutSession extends Document {
  userId: Types.ObjectId;
  workoutPlanId: Types.ObjectId;
  dayOfWeek: number;
  sessionName: string;
  focusArea: string;
  estimatedDuration: number;
  estimatedCalories: number;
  exercises: ISessionExercise[];
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionExerciseSchema = new Schema<ISessionExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    targetSets: { type: Number, default: 3 },
    targetReps: { type: Number, default: 12 },
    restSeconds: { type: Number, default: 60 },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workoutPlanId: { type: Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 1, max: 7 },
    sessionName: { type: String, required: true },
    focusArea: { type: String, default: 'General' },
    estimatedDuration: { type: Number, default: 45 },
    estimatedCalories: { type: Number, default: 280 },
    exercises: [SessionExerciseSchema],
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const WorkoutSession = model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);
