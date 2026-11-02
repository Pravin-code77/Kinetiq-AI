import { Schema, model, Document, Types } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  workoutReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  checkinReminders: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    workoutReminders: { type: Boolean, default: true },
    mealReminders: { type: Boolean, default: true },
    hydrationReminders: { type: Boolean, default: true },
    checkinReminders: { type: Boolean, default: true },
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '07:00' },
    fcmToken: { type: String, default: '' },
  },
  { timestamps: true }
);

export const NotificationPreference = model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
