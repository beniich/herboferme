/**
 * routes/billing.ts
 * Stripe billing integration.
 *
 * POST /api/billing/webhook          â†’ Stripe webhook (signature verified, no fallback)
 * POST /api/billing/create-checkout  â†’ Create Stripe checkout session
 * GET  /api/billing/subscription     â†’ Get current org subscription
 * POST /api/billing/cancel           â†’ Cancel subscription
 */
import { Router, Request, Response, raw } from 'express';
import Stripe from 'stripe';
import { subscriptionService } from '../services/subscriptionService.js';
import { authenticate } from '../middleware/security.js';
import { globalLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { User } from '../models/user.model.js';
import { AppError, NotFoundAppError } from '../utils/AppError.js';
import { Subscription, PLAN_FEATURES, PLAN_MAX_USERS } from '../models/Subscription.js';
import logger from '../utils/logger.js';

const router = Router();

const stripeApiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeApiKey, {
  apiVersion: '2023-10-16' as any,
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   POST /api/billing/webhook
   MUST use raw body â€” express.json() breaks Stripe signature
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
router.post(
  '/webhook',
  globalLimiter,
  raw({ type: 'application/json' }), // raw body for signature verification
  asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      logger.warn('[billing] Webhook received without stripe-signature header', { requestId: req.id });
      return sendError(res, 'Missing stripe-signature header', 'WEBHOOK_INVALID', 400, req.id);
    }

    let event: Stripe.Event;
    try {
      // Signature verification â€” NO fallback. Fail hard if invalid.
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      logger.warn('[billing] Webhook signature verification failed', {
        requestId: req.id,
        error: err instanceof Error ? err.message : 'Unknown',
      });
      return sendError(res, 'Webhook signature invalid', 'WEBHOOK_SIGNATURE_INVALID', 400, req.id);
    }

    logger.info('[billing] Webhook received', { requestId: req.id, type: event.type, id: event.id });

    // Handle checkout session completed â€” provision subscription
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      const plan = (session.metadata?.plan as 'starter' | 'pro' | 'enterprise') ?? 'starter';

      if (orgId && session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;

        // Use dynamic price from DB/metadata â€” NOT hardcoded
        await Subscription.findOneAndUpdate(
          { orgId },
          {
            orgId,
            plan,
            status: subscription.status as any,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price?.id ?? '',
            stripeCustomerId: session.customer as string,
            maxUsers: PLAN_MAX_USERS[plan],
            features: PLAN_FEATURES[plan],
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          { upsert: true, new: true },
        );

        logger.info('[billing] Subscription provisioned', { orgId, plan, requestId: req.id });
      }
    } else {
      await subscriptionService.updateFromStripeWebhook(event as any);
    }

    // Always return 200 to Stripe (they retry on non-2xx)
    return sendSuccess(res, { received: true }, 200, req.id);
  }),
);

/* â”€â”€ POST /api/billing/create-checkout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
router.post(
  '/create-checkout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { plan, successUrl, cancelUrl } = req.body;

    if (!['starter', 'pro', 'enterprise'].includes(plan)) {
      throw new AppError('Invalid plan', 400, 'BILLING_INVALID_PLAN');
    }

    // Fetch price from Stripe dynamically by plan metadata â€” no hardcoded price IDs
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    const price = prices.data.find(
      p => (p.product as Stripe.Product).metadata?.plan === plan,
    );

    if (!price) {
      throw new AppError(`No active price found for plan: ${plan}`, 404, 'BILLING_PRICE_NOT_FOUND');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price.id as string, quantity: 1 }],
      success_url: successUrl || `${process.env.FRONTEND_URL}/billing/success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        orgId: req.user!.orgId,
        plan,
      },
    } as any);

    return sendSuccess(res, { url: session.url }, 200, req.id);
  }),
);

/* â”€â”€ GET /api/billing/subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
router.get(
  '/subscription',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const subscription = await subscriptionService.getSubscription(req.user!.orgId as string);
    if (!subscription) {
      return sendSuccess(
        res,
        { plan: 'starter', status: 'none', features: PLAN_FEATURES.starter },
        200,
        req.id,
      );
    }
    return sendSuccess(res, subscription, 200, req.id);
  }),
);

/* ── POST /api/billing/mock-checkout ────────────────────────── */
// Route to manually upgrade the organization to Enterprise plan without real Stripe payments
router.post(
  '/mock-checkout',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const orgId = req.user!.organizationId || req.user!.orgId;

    if (!orgId) {
      throw new AppError('No organization found for this user', 400, 'NO_ORG');
    }

    const plan = 'enterprise';

    // 1. Update the Subscription collection
    await Subscription.findOneAndUpdate(
      { orgId },
      {
        orgId,
        plan,
        status: 'active',
        stripeSubscriptionId: 'mock_sub_12345',
        stripePriceId: 'mock_price_12345',
        stripeCustomerId: 'mock_cus_12345',
        maxUsers: PLAN_MAX_USERS[plan],
        features: PLAN_FEATURES[plan],
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        cancelAtPeriodEnd: false,
      },
      { upsert: true, new: true }
    );

    // 2. Update User Plan
    await User.findByIdAndUpdate(req.user!.id || req.user!._id, { plan: 'entreprise' });

    return sendSuccess(res, { message: 'Plan upgraded to Enterprise (Mock mode)', plan: 'enterprise' }, 200, req.id);
  })
);

export default router;
