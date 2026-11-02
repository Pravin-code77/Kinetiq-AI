import { Schema, model, Document, Types } from 'mongoose';

export interface ILoggedSet {
  setNumber: number;
  repsCompleted: number;
  weightKg?: number;
  completed: boolean;
}

export interface IExerciseLog extends Document {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  exerciseId: Types.ObjectId;
  loggedSets: ILoggedSet[];
  rpe?: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoggedSetSchema = new Schema<ILoggedSet>(
  {
    setNumber: { type: Number, required: true },
    repsCompleted: { type: Number, required: true },
    weightKg: { type: Number, default: 0 },
    completed: { type: Boolean, default: true },
  },
  { _id: false }
);

const ExerciseLogSchema = new Schema<IExerciseLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'WorkoutSession', required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
    loggedSets: [LoggedSetSchema],
    rpe: { type: Number, min: 1, max: 10, default: 7 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ExerciseLog = model<IExerciseLog>('ExerciseLog', ExerciseLogSchema);
