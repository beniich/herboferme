/**
 * models/subscription.model.ts — Abonnements Stripe
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId:                 mongoose.Types.ObjectId;
  plan:                   'essai' | 'essentiel' | 'professionnel' | 'entreprise';
  status:                 'pending' | 'active' | 'trial' | 'cancelled' | 'expired';
  stripeCustomerId?:      string;
  stripeSubscriptionId?:  string;
  stripePaymentIntentId?: string;
  activatedAt?:           Date;
  currentPeriodEnd?:      Date;
  cancelledAt?:           Date;
  createdAt:              Date;
  updatedAt:              Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId:                 { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan:                   { type: String, enum: ['essai','essentiel','professionnel','entreprise'], required: true },
  status:                 { type: String, enum: ['pending','active','trial','cancelled','expired'], default: 'pending' },
  stripeCustomerId:       { type: String, index: true },
  stripeSubscriptionId:   { type: String },
  stripePaymentIntentId:  { type: String },
  activatedAt:            { type: Date },
  currentPeriodEnd:       { type: Date },
  cancelledAt:            { type: Date },
}, { timestamps: true });

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
