# Stripe Payment Integration Guide

## Required Environment Variables

Add these to your `.env` file:

```bash
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (get from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add them to `.env`

### 2. Setup Webhook (for production)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to `.env` as `STRIPE_WEBHOOK_SECRET`

### 3. Local Webhook Testing (optional)

Install Stripe CLI:
```bash
# Windows
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to local dev:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret shown and add to `.env`.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Database Migration

```bash
npx prisma generate
npx prisma db push
```

## Usage

### Admin: Manage Products

1. Go to `/admin/products`
2. Click "Add Product"
3. Fill in:
   - **Name**: Product name
   - **Price**: Product price (e.g., 9.99)
   - **Currency**: EUR, USD, or GBP
   - **Description**: Optional description
   - **Active**: Whether product is available for purchase
4. Click "Create Product"

The product will be automatically created in both your database and Stripe.

### Test Buying Flow

1. Go to `/test-buy`
2. Click "Buy Now" on any product
3. You'll be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete payment
6. You'll be redirected to `/checkout/success`

## API Routes

### Public Routes

- `GET /api/products` - List all active products
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks (Stripe calls this)

### Admin Routes (TODO: Add authentication)

- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `GET /api/admin/products/[id]` - Get single product
- `PATCH /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product (soft delete)

## Database Schema

### Product Model
```prisma
model Product {
  id              String   @id @default(cuid())
  name            String
  description     String?
  price           Float
  currency        String   @default("eur")
  stripePriceId   String?  @unique
  stripeProductId String?  @unique
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  purchases       Purchase[]
}
```

### Purchase Model
```prisma
model Purchase {
  id                  String   @id @default(cuid())
  userId              String
  productId           String
  amount              Float
  currency            String
  status              String   @default("pending")
  stripeSessionId     String?  @unique
  stripePaymentIntent String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

## Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

More test cards: https://stripe.com/docs/testing

## Troubleshooting

### "Cannot find module 'stripe'"
```bash
npm install stripe @stripe/stripe-js
```

### Webhook not working locally
Use Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Product creation fails
1. Check `STRIPE_SECRET_KEY` is set correctly
2. Ensure Stripe key starts with `sk_test_` (test mode)
3. Check Stripe Dashboard for errors

### Payment succeeds but purchase status not updated
1. Check webhook is configured correctly
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check webhook logs in Stripe Dashboard

## Production Checklist

- [ ] Replace test keys with live keys (`sk_live_`, `pk_live_`)
- [ ] Set up production webhook endpoint
- [ ] Add authentication to admin routes
- [ ] Enable webhook signature verification
- [ ] Set up proper error logging
- [ ] Test all payment flows
- [ ] Configure CORS if needed
- [ ] Set proper `NEXT_PUBLIC_APP_URL`

## Security Notes

1. **Never commit** `.env` file to git
2. **Always verify** webhook signatures
3. **Add authentication** to admin routes before production
4. **Use HTTPS** in production for webhooks
5. **Rotate secrets** periodically
