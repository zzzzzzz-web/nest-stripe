# nest-stripe

NestJS REST API with Stripe integration. Handles customers, payment intents, and subscriptions, backed by PostgreSQL via Prisma.

## Requirements

- Docker + Docker Compose
- Node.js 24+ (for local tooling)

## Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the app listens on (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGRES_USER` | Postgres username |
| `POSTGRES_PASSWORD` | Postgres password |
| `POSTGRES_DB` | Postgres database name |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `JWT_SECRET` | Secret used to sign JWT tokens |

## Development

Start the app and database:

```bash
docker compose up --build
```

The app runs via `ts-node-dev` — no compilation step. Changes to `src/` hot-reload automatically.

### Initialize the database

On first run, apply the Prisma migrations:

```bash
docker compose up -d
docker compose exec app npx prisma migrate dev --name init
```

Subsequent schema changes:

```bash
docker compose exec app npx prisma migrate dev --name <migration-name>
```

## Production

Build and run the production image:

```bash
docker build --target production -t nest-stripe .
docker run --env-file .env -p 3000:3000 -e NODE_ENV=production nest-stripe
```

The production build compiles TypeScript to `dist/` inside the image. No source files or `node_modules` are mounted. Swagger docs are disabled when `NODE_ENV=production`.

## API

All routes are prefixed with `/api`. Protected routes require a `Authorization: Bearer <token>` header.

### Authentication

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user, returns JWT |
| `POST` | `/api/auth/login` | Login, returns JWT |

### Customers

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/customers` | Public | Create a customer |
| `GET` | `/api/customers` | Required | List customers |
| `GET` | `/api/customers/:id` | Required | Get a customer |
| `DELETE` | `/api/customers/:id` | Required | Delete a customer |

### Payments

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/intents` | Public | Create a payment intent |
| `GET` | `/api/payments/intents` | Required | List payment intents |
| `GET` | `/api/payments/intents/:id` | Required | Get a payment intent |
| `POST` | `/api/payments/intents/:id/cancel` | Required | Cancel a payment intent |

### Subscriptions

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/subscriptions` | Required | Create a subscription |
| `GET` | `/api/subscriptions` | Required | List subscriptions |
| `GET` | `/api/subscriptions/:id` | Required | Get a subscription |
| `PATCH` | `/api/subscriptions/:id` | Required | Update a subscription |
| `DELETE` | `/api/subscriptions/:id` | Required | Cancel a subscription |

### Webhooks

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/webhooks/stripe` | Stripe signature | Stripe webhook receiver |

Stripe webhook events handled: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

For local webhook testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will print a `whsec_...` secret — set that as `STRIPE_WEBHOOK_SECRET` in `.env` and restart the app.

For production, create a webhook endpoint in the Stripe Dashboard (Developers → Webhooks) pointing to your public URL, and use the signing secret it provides.

## Demo

The `demo/` directory contains standalone HTML pages for testing the API in a browser — no build step, just open the file.

| Page | Description | Auth |
|---|---|---|
| `index.html` | Landing page with links to all demos | — |
| `dashboard.html` | Lists all customers and recent payments. Auto-creates a demo admin account on first load. | Auto |
| `checkout.html` | One-time payment using Stripe Elements | Public |
| `customers.html` | Create a Stripe customer | Public |

Pages share a `shared.js` (API helpers, auth token storage) and `shared.css`. The Stripe publishable key is entered once via a settings popover and saved to `localStorage`.

## Swagger

API documentation is available at `http://localhost:3000/docs` in development. Disabled in production.

## Testing

```bash
# Unit tests
npm test

# E2e tests
npm run test:e2e

# Type check
npx tsc --noEmit

# Lint
npm run lint
```
