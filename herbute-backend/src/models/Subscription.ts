/**
 * models/Subscription.ts
 * Organization subscription â€” synced from Stripe via webhook.
 */
import mongoose, { Document, Schema, Types } from 'mongoose';

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

export interface ISubscription extends Document {
  orgId: Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCustomerId: string;
  maxUsers: number;
  features: string[];
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive(): boolean;
}

/** Feature sets per plan â€” single source of truth */
export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  starter: ['complaints:basic', 'reports:basic'],
  pro: ['complaints:basic', 'complaints:advanced', 'reports:basic', 'reports:advanced', 'api_access'],
  enterprise: [
    'complaints:basic', 'complaints:advanced',
    'reports:basic', 'reports:advanced',
    'api_access', 'sso', 'advanced_analytics', 'custom_branding', 'priority_support',
  ],
};

export const PLAN_MAX_USERS: Record<SubscriptionPlan, number> = {
  starter: 5,
  pro: 25,
  enterprise: 999,
};

const SubscriptionSchema = new Schema<ISubscription>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'pro', 'enterprise'],
      required: true,
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid'],
      required: true,
      default: 'active',
    },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    stripePriceId: { type: String, required: true },
    stripeCustomerId: { type: String, required: true, index: true },
    maxUsers: { type: Number, required: true, default: 5 },
    features: { type: [String], default: PLAN_FEATURES.starter },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'subscriptions' },
);

SubscriptionSchema.methods.isActive = function (): boolean {
  return ['active', 'trialing'].includes(this.status) && new Date() < this.currentPeriodEnd;
};

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
