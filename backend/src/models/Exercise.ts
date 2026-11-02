import { Schema, model, Document } from 'mongoose';

export interface IExercise extends Document {
  name: string;
  description: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Abs' | 'Cardio' | 'Full Body';
  equipmentTag: 'No Equipment' | 'Home Equipment' | 'Full Gym';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  metValue: number;
  instructions: string[];
  imageUrl: string;
  videoUrl?: string;
  exclusionTags: string[];
  progressionType: 'reps' | 'weight' | 'time';
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  estimatedCaloriesPerMinute: number;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    muscleGroup: {
      type: String,
      enum: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio', 'Full Body'],
      required: true,
      index: true,
    },
    equipmentTag: {
      type: String,
      enum: ['No Equipment', 'Home Equipment', 'Full Gym'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    metValue: { type: Number, default: 5.0 },
    instructions: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    exclusionTags: { type: [String], default: [] },
    progressionType: { type: String, enum: ['reps', 'weight', 'time'], default: 'reps' },
    defaultSets: { type: Number, default: 3 },
    defaultReps: { type: Number, default: 12 },
    defaultRestSeconds: { type: Number, default: 60 },
    estimatedCaloriesPerMinute: { type: Number, default: 7 },
  },
  { timestamps: true }
);

export const Exercise = model<IExercise>('Exercise', ExerciseSchema);
