import { Schema, model, Document, Types } from 'mongoose';

export interface IUserBadge extends Document {
  userId: Types.ObjectId;
  badgeId: Types.ObjectId;
  awardedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true, index: true },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = model<IUserBadge>('UserBadge', UserBadgeSchema);
