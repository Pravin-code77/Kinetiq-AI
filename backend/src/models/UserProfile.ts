import { Schema, model, Document, Types } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Recomposition' | 'Endurance';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  equipmentAccess: 'No Equipment' | 'Home Equipment' | 'Full Gym';
  sessionMinutes: number;
  daysPerWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    age: { type: Number, required: true, min: 14, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    heightCm: { type: Number, required: true, min: 90, max: 250 },
    weightKg: { type: Number, required: true, min: 30, max: 300 },
    fitnessLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
      required: true,
    },
    fitnessGoal: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Recomposition', 'Endurance'],
      default: 'General Fitness',
      required: true,
    },
    activityLevel: {
      type: String,
      enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'],
      default: 'Moderately Active',
      required: true,
    },
    equipmentAccess: {
      type: String,
      enum: ['No Equipment', 'Home Equipment', 'Full Gym'],
      default: 'No Equipment',
      required: true,
    },
    sessionMinutes: { type: Number, enum: [15, 30, 45, 60], default: 45 },
    daysPerWeek: { type: Number, min: 1, max: 7, default: 3 },
  },
  { timestamps: true }
);

export const UserProfile = model<IUserProfile>('UserProfile', UserProfileSchema);
