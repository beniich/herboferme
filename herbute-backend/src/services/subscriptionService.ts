/**
 * services/subscriptionService.ts
 * Manages subscription plan enforcement.
 * Reads from DB (with simple in-process cache to avoid DB hits on every request).
 */
import { Subscription, ISubscription, PLAN_FEATURES, PLAN_MAX_USERS } from '../models/Subscription.js';
import { UserLimitError, SubscriptionError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

// Simple in-memory cache: orgId          { subscription, cachedAt }
const cache = new Map<string, { data: ISubscription; cachedAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

async function getCached(orgId: string): Promise<ISubscription | null> {
  const cached = cache.get(orgId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }
  const sub = await Subscription.findOne({ orgId }).lean() as ISubscription | null;
  if (sub) {
    cache.set(orgId, { data: sub, cachedAt: Date.now() });
  }
  return sub;
}

function invalidateCache(orgId: string): void {
  cache.delete(orgId);
}

export const subscriptionService = {
  /** Get subscription for an org */
  async getSubscription(orgId: string): Promise<ISubscription | null> {
    return getCached(orgId);
  },

  /** Check if org has access to a specific feature */
  async hasFeature(orgId: string, feature: string): Promise<boolean> {
    const sub = await getCached(orgId);
    if (!sub) {
      // No subscription          starter features only
      return PLAN_FEATURES.starter.includes(feature);
    }
    if (!['active', 'trialing'].includes(sub.status)) {
      return false;
    }
    return sub.features.includes(feature) || sub.features.includes('*');
  },

  /** Throw UserLimitError if org has reached its user cap */
  async enforceUserLimit(orgId: string, currentUserCount: number): Promise<void> {
    const sub = await getCached(orgId);
    const limit = sub ? sub.maxUsers : PLAN_MAX_USERS.starter;
    if (currentUserCount >= limit) {
      throw new UserLimitError();
    }
  },

  /**
   * Called from Stripe webhook to sync subscription state.
   * Handles: checkout.session.completed, customer.subscription.updated,
   *          customer.subscription.deleted, invoice.payment_failed
   */
  async updateFromStripeWebhook(
    stripeEvent: { type: string; data: { object: any } }
  ): Promise<void> {
    const obj = stripeEvent.data.object;

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        // Initial purchase          provisioned in billing route
        logger.info('[subscriptionService] checkout.session.completed', {
          sessionId: obj.id,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const orgId = obj.metadata?.orgId;
        if (!orgId) {
          logger.warn('[subscriptionService] subscription.updated missing orgId in metadata');
          break;
        }
        const plan = obj.metadata?.plan ?? 'starter';
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: obj.id },
          {
            status: obj.status,
            stripePriceId: obj.items.data[0]?.price?.id,
            currentPeriodEnd: new Date(obj.current_period_end * 1000),
            cancelAtPeriodEnd: obj.cancel_at_period_end,
            plan,
            features: PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES] ?? PLAN_FEATURES.starter,
            maxUsers: PLAN_MAX_USERS[plan as keyof typeof PLAN_MAX_USERS] ?? PLAN_MAX_USERS.starter,
          },
          { upsert: true, new: true },
        );
        invalidateCache(orgId);
        logger.info('[subscriptionService] Subscription updated', { orgId, plan, status: obj.status });
        break;
      }

      case 'customer.subscription.deleted': {
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: obj.id },
          { status: 'canceled' },
        );
        const orgId = obj.metadata?.orgId;
        if (orgId) invalidateCache(orgId);
        logger.info('[subscriptionService] Subscription canceled', { subscriptionId: obj.id });
        break;
      }

      case 'invoice.payment_failed': {
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: obj.customer },
          { status: 'past_due' },
        );
        logger.warn('[subscriptionService] Payment failed', { customerId: obj.customer });
        break;
      }

      default:
        logger.debug('[subscriptionService] Unhandled Stripe event type', { type: stripeEvent.type });
    }
  },
};
