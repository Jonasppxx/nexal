# Subscription System Guide

## Overview

Dieses Projekt enthält ein vollständiges Abonnement-System mit Stripe-Integration, das monatliche wiederkehrende Zahlungen unterstützt.

## Features

✅ Monatliche Abonnements via Stripe
✅ Automatische Verwaltung von Abonnement-Status
✅ Premium-Content für Abonnenten
✅ Abonnement-Kündigung (am Ende der Laufzeit)
✅ Admin-Interface zur Produkt-Verwaltung
✅ Webhook-Integration für automatische Updates

## Einrichtung

### 1. Umgebungsvariablen

Alle benötigten Variablen in `.env`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Webhook konfigurieren

1. Gehe zu [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Klicke "Add endpoint"
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Wähle diese Events:
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Kopiere das **Signing Secret** → `.env` als `STRIPE_WEBHOOK_SECRET`

### 3. Lokales Testen mit Stripe CLI

```bash
# Stripe CLI installieren
scoop install stripe  # Windows
# oder: brew install stripe/stripe-cli/stripe  # Mac

# Login
stripe login

# Webhooks lokal weiterleiten
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Kopiere den angezeigten Webhook-Secret in `.env`.

## Seiten und Funktionen

### User-Seiten

| Route | Beschreibung | Zugriff |
|-------|--------------|---------|
| `/subscribe` | Abonnement-Pläne ansehen | Eingeloggte User |
| `/subscriptions` | Meine Abonnements verwalten | Eingeloggte User |
| `/premium` | Premium-Content (nur für Abonnenten) | **Nur aktive Abonnenten** |
| `/subscription/success` | Erfolgsseite nach Zahlung | Nach Stripe Checkout |
| `/subscription/cancel` | Abbruch-Seite | Bei Abbruch |

### Admin-Seiten

| Route | Beschreibung | Zugriff |
|-------|--------------|---------|
| `/admin/products` | Produkte/Abonnements verwalten | Nur Admins |

### API-Endpunkte

#### Public

- `GET /api/products` - Alle aktiven Produkte/Abonnements

#### User

- `GET /api/user/subscriptions?userId=xxx` - Abonnements eines Users
- `POST /api/stripe/create-subscription` - Neues Abonnement erstellen
- `POST /api/stripe/cancel-subscription` - Abonnement kündigen
- `POST /api/stripe/webhook` - Stripe Webhook Handler

#### Admin

- `GET /api/admin/products` - Alle Produkte
- `POST /api/admin/products` - Produkt erstellen
- `GET /api/admin/products/[id]` - Einzelnes Produkt
- `PATCH /api/admin/products/[id]` - Produkt aktualisieren
- `DELETE /api/admin/products/[id]` - Produkt löschen

## Workflow

### 1. Admin erstellt Abonnement-Plan

1. Gehe zu `/admin/products`
2. Klicke "Add Product"
3. Fülle aus:
   - **Name**: z.B. "Premium Monthly"
   - **Price**: 9.99 (monatlicher Preis)
   - **Currency**: EUR
   - **Description**: Beschreibung der Vorteile
   - **Active**: ✅
   - **Subscription (Monthly)**: ✅
4. Klicke "Create Product"

Das Produkt wird automatisch in Stripe erstellt mit:
- Product in Stripe
- Recurring Price (monatlich)
- Eintrag in der Datenbank

### 2. User abonniert

1. User geht zu `/subscribe`
2. Wählt einen Plan
3. Klickt "Subscribe Now"
4. Wird zu Stripe Checkout weitergeleitet
5. Zahlt mit Testkarte: `4242 4242 4242 4242`
6. Wird zu `/subscription/success` weitergeleitet

### 3. Automatische Webhook-Verarbeitung

Nach erfolgreicher Zahlung:
1. Stripe sendet `checkout.session.completed` Event
2. Webhook erstellt `Subscription`-Eintrag in DB:
   ```js
   {
     userId: "...",
     productId: "...",
     status: "active",
     stripeSubscriptionId: "sub_...",
     currentPeriodEnd: "2025-12-09",
     ...
   }
   ```

### 4. User greift auf Premium-Content zu

1. User geht zu `/premium`
2. System prüft aktives Abonnement
3. ✅ **Aktiv**: Content wird angezeigt
4. ❌ **Nicht aktiv**: Weiterleitung zu `/subscribe`

### 5. User kündigt Abonnement

1. User geht zu `/subscriptions`
2. Klickt "Cancel Subscription"
3. Abonnement wird bei Stripe auf `cancel_at_period_end` gesetzt
4. Webhook aktualisiert DB
5. User hat bis zum Ende des Monats Zugriff
6. Am Ende: Status → `canceled`

## Datenbank-Schema

### Subscription Model

```prisma
model Subscription {
  id                     String   @id @default(cuid())
  userId                 String
  productId              String
  stripeSubscriptionId   String   @unique
  stripeCustomerId       String
  stripePriceId          String
  status                 String   // active, canceled, past_due, unpaid
  currentPeriodStart     DateTime
  currentPeriodEnd       DateTime
  cancelAtPeriodEnd      Boolean  @default(false)
  canceledAt             DateTime?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

### Product Model (erweitert)

```prisma
model Product {
  id              String   @id @default(cuid())
  name            String
  description     String?
  price           Float    // Monatlicher Preis
  currency        String   @default("eur")
  stripePriceId   String?  @unique
  stripeProductId String?  @unique
  active          Boolean  @default(true)
  isSubscription  Boolean  @default(true)  // NEU!
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Subscription-Status

| Status | Bedeutung |
|--------|-----------|
| `active` | Abonnement aktiv, Zahlung erfolgreich |
| `trialing` | Test-Phase (falls konfiguriert) |
| `past_due` | Zahlung fehlgeschlagen, wird wiederholt |
| `canceled` | Abonnement gekündigt |
| `unpaid` | Alle Zahlungsversuche fehlgeschlagen |
| `incomplete` | Zahlung nicht abgeschlossen |

## Zugriffskontrolle auf Premium-Content

```typescript
// Beispiel: Premium-Seite schützen
const res = await fetch(`/api/user/subscriptions?userId=${userId}`);
const { subscriptions } = await res.json();

const hasAccess = subscriptions.some(
  (sub) => sub.status === 'active' || sub.status === 'trialing'
);

if (!hasAccess) {
  // Zugriff verweigert → Weiterleitung
  router.push('/subscribe');
}
```

## Stripe Test-Karten

| Zweck | Kartennummer | Ergebnis |
|-------|--------------|----------|
| Erfolg | `4242 4242 4242 4242` | ✅ Zahlung erfolgreich |
| Abgelehnt | `4000 0000 0000 0002` | ❌ Zahlung abgelehnt |
| 3D Secure | `4000 0025 0000 3155` | 🔐 Authentifizierung nötig |
| Guthaben fehlt | `4000 0000 0000 9995` | ❌ Insufficient funds |

**Alle Testkarten:**
- Ablaufdatum: Beliebiges Datum in der Zukunft
- CVC: Beliebige 3 Ziffern
- PLZ: Beliebige 5 Ziffern

## Troubleshooting

### Webhook funktioniert nicht lokal

**Lösung:** Stripe CLI verwenden
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Abonnement wird nicht in DB erstellt

1. Prüfe Webhook-Logs in Stripe Dashboard
2. Prüfe `STRIPE_WEBHOOK_SECRET` in `.env`
3. Prüfe Server-Logs für Fehler

### User hat keinen Zugriff auf Premium-Content

1. Prüfe `/subscriptions` - ist Status `active`?
2. Prüfe `currentPeriodEnd` - noch nicht abgelaufen?
3. Prüfe `cancelAtPeriodEnd` - false?

### Product-Erstellung schlägt fehl

1. Prüfe `STRIPE_SECRET_KEY` in `.env`
2. Prüfe Stripe Dashboard für Fehler
3. Key muss mit `sk_test_` beginnen (Testmodus)

## Production Checklist

- [ ] Live-Keys verwenden (`sk_live_`, `pk_live_`)
- [ ] Production Webhook mit HTTPS einrichten
- [ ] Webhook-Secret aktualisieren
- [ ] Admin-Routen absichern (Authentication)
- [ ] Error-Logging einrichten (Sentry, etc.)
- [ ] Email-Benachrichtigungen für Abonnenten
- [ ] Rechnungserstellung (Stripe Customer Portal)
- [ ] DSGVO-Konformität prüfen
- [ ] Widerrufsbelehrung hinzufügen
- [ ] AGB aktualisieren

## Erweiterte Features (Optional)

### Stripe Customer Portal

Ermöglicht Usern direkt bei Stripe:
- Zahlungsmethoden verwalten
- Rechnungen herunterladen
- Abonnement selbst kündigen

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriptions`,
});

// User zu session.url weiterleiten
```

### Trial Period (Testphase)

```typescript
// Bei Stripe Price-Erstellung
const stripePrice = await stripe.prices.create({
  product: stripeProduct.id,
  unit_amount: Math.round(price * 100),
  currency: 'eur',
  recurring: { 
    interval: 'month',
    trial_period_days: 14  // 14 Tage gratis
  },
});
```

### Mehrere Abonnement-Stufen

Erstelle verschiedene Produkte:
- Basic: 4.99 EUR/Monat
- Premium: 9.99 EUR/Monat
- Enterprise: 19.99 EUR/Monat

Jedes mit unterschiedlichen Features in `/premium`.

## Support

Bei Problemen:
1. Stripe Dashboard → Logs → Events
2. Stripe Dashboard → Developers → Webhooks
3. Server-Logs prüfen
4. [Stripe Docs](https://stripe.com/docs/billing/subscriptions/overview)
