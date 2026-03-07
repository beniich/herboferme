# 🎯 FootballHub+ - PRIORITÉS 2, 3 & 4 (PLAN COMPLET)

## 🟡 PRIORITÉ 2 - CE MOIS (30 JOURS)

### Objectif : Monétisation et Administration

---

### 📅 SEMAINE 1-2 : SYSTÈME DE PAIEMENT STRIPE

#### ✅ Tâche 1 : Configuration Stripe

```bash
# Install Stripe
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
// server/src/config/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'mad', // Moroccan Dirham
  paymentMethods: ['card', 'cashapp'], // Add more as needed
};
```

```typescript
// server/src/routes/payments.ts
import express from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { authenticate } from '../middleware/auth';
import Order from '../models/Order';

const router = express.Router();

// Create Payment Intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: STRIPE_CONFIG.currency,
      payment_method_types: ['card'],
      metadata: {
        orderId,
        userId: req.userId,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Webhook handler (Stripe events)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update order status
        await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
          paymentStatus: 'Paid',
          paidAt: new Date(),
        });

        console.log('✅ Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        
        await Order.findByIdAndUpdate(failedIntent.metadata.orderId, {
          paymentStatus: 'Failed',
        });

        console.log('❌ Payment failed:', failedIntent.id);
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
```

```typescript
// web/components/checkout/StripeCheckout.tsx
'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/success`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg disabled:opacity-50 transition-colors"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export const StripeCheckout: React.FC<{ amount: number; orderId: string }> = ({
  amount,
  orderId,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  React.useEffect(() => {
    // Create PaymentIntent
    fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, orderId }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount, orderId]);

  if (!clientSecret) {
    return <div className="text-center py-8">Loading payment...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
};
```

---

### 📅 SEMAINE 2-3 : BILLETTERIE QR CODES

#### ✅ Tâche 2 : Génération QR Codes

```bash
# Install QR code library
npm install qrcode
npm install --save-dev @types/qrcode
```

```typescript
// server/src/services/qrCodeService.ts
import QRCode from 'qrcode';
import crypto from 'crypto';

class QRCodeService {
  /**
   * Generate unique ticket code
   */
  generateTicketCode(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate QR code for ticket
   */
  async generateQRCode(ticketCode: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(ticketCode, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw error;
    }
  }

  /**
   * Validate ticket code
   */
  async validateTicket(ticketCode: string, eventId: string): Promise<boolean> {
    try {
      const ticket = await Ticket.findOne({
        code: ticketCode,
        event: eventId,
        status: 'Valid',
      });

      if (!ticket) return false;

      // Mark ticket as used
      ticket.status = 'Used';
      ticket.scannedAt = new Date();
      await ticket.save();

      return true;
    } catch (error) {
      console.error('Ticket validation error:', error);
      return false;
    }
  }
}

export const qrCodeService = new QRCodeService();
```

```typescript
// server/src/routes/tickets.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import { qrCodeService } from '../services/qrCodeService';
import Ticket from '../models/Ticket';
import Event from '../models/Event';

const router = express.Router();

// Purchase ticket
router.post('/purchase', authenticate, async (req, res) => {
  try {
    const { eventId, seatNumber } = req.body;

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Generate ticket
    const ticketCode = qrCodeService.generateTicketCode();
    const qrCode = await qrCodeService.generateQRCode(ticketCode);

    const ticket = await Ticket.create({
      user: req.userId,
      event: eventId,
      code: ticketCode,
      qrCode,
      seatNumber,
      price: event.ticketPrice,
      status: 'Valid',
    });

    res.json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Validate ticket (Scanner)
router.post('/validate', authenticate, async (req, res) => {
  try {
    const { ticketCode, eventId } = req.body;

    const isValid = await qrCodeService.validateTicket(ticketCode, eventId);

    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Ticket validated successfully' : 'Invalid ticket',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user tickets
router.get('/my-tickets', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.userId })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
```

```typescript
// web/components/tickets/TicketCard.tsx
'use client';

import React from 'react';
import { QrCode, Calendar, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

interface Ticket {
  _id: string;
  code: string;
  qrCode: string;
  event: {
    name: string;
    date: string;
    venue: string;
  };
  seatNumber: string;
  status: string;
}

export const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const [showQR, setShowQR] = React.useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {ticket.event.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{new Date(ticket.event.date).toLocaleDateString('fr-FR')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{new Date(ticket.event.date).toLocaleTimeString('fr-FR')}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{ticket.event.venue}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Seat</span>
          <span className="font-bold text-lg">{ticket.seatNumber}</span>
        </div>

        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <QrCode size={20} />
          {showQR ? 'Hide QR Code' : 'Show QR Code'}
        </button>

        {showQR && (
          <div className="mt-6 flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              <Image
                src={ticket.qrCode}
                alt="Ticket QR Code"
                width={250}
                height={250}
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                Code: {ticket.code}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={`px-6 py-3 ${
        ticket.status === 'Valid'
          ? 'bg-green-100 dark:bg-green-900/20'
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <p className={`text-center text-sm font-medium ${
          ticket.status === 'Valid'
            ? 'text-green-700 dark:text-green-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {ticket.status === 'Valid' ? '✓ Valid Ticket' : '✗ Used'}
        </p>
      </div>
    </div>
  );
};
```

---

### 📅 SEMAINE 3-4 : DASHBOARD ADMIN COMPLET

```typescript
// web/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalTickets: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch from API
    const response = await fetch('/api/admin/stats');
    const data = await response.json();
    setStats(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          change="+12%"
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          title="Revenue"
          value={`${stats.totalRevenue} MAD`}
          change="+8%"
          color="green"
        />
        <StatCard
          icon={Calendar}
          title="Events"
          value={stats.totalEvents}
          change="+5%"
          color="purple"
        />
        <StatCard
          icon={FileText}
          title="Tickets Sold"
          value={stats.totalTickets}
          change="+15%"
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Revenue Overview</h3>
          {/* Add chart component */}
        </div>

        {/* Users Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">User Growth</h3>
          {/* Add chart component */}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        {/* Add activity list */}
      </div>
    </div>
  );
}

const StatCard: React.FC<{
  icon: any;
  title: string;
  value: string | number;
  change: string;
  color: string;
}> = ({ icon: Icon, title, value, change, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`text-${color}-600`} size={24} />
    </div>
    <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
    <div className="flex items-end justify-between">
      <p className="text-2xl font-bold">{value}</p>
      <span className="text-green-600 text-sm font-medium">{change}</span>
    </div>
  </div>
);
```

---

## 📊 CHECKLIST PRIORITÉ 2

```
□ STRIPE PAIEMENTS
  □ Stripe SDK installé
  □ Payment Intent API créée
  □ Webhooks configurés
  □ Frontend checkout component
  □ Tests paiement OK
  □ Refunds handled

□ BILLETTERIE
  □ QR Code génération
  □ Ticket model créé
  □ Purchase endpoint
  □ Validation endpoint
  □ Scanner mobile (Capacitor)
  □ Email confirmation

□ DASHBOARD ADMIN
  □ Stats API créée
  □ Charts intégrés
  □ User management
  □ Event management
  □ Order management
  □ Analytics tracking
```

**Temps estimé:** 30 jours
**Ressources:** 2 développeurs

Suite avec Priorité 3 & 4 ! 🚀
