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

## Development

Start the app and database:

```bash
docker compose up --build
```

The app runs via `ts-node-dev` — no compilation step. Changes to `src/` hot-reload automatically.

### Initialize the database

On first run, apply the Prisma migrations:

```bash
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
docker run --env-file .env -p 3000:3000 nest-stripe
```

The production build compiles TypeScript to `dist/` inside the image. No source files or `node_modules` are mounted.

## API

All routes are prefixed with `/api`.

### Customers

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/customers` | Create a customer |
| `GET` | `/api/customers` | List customers |
| `GET` | `/api/customers/:id` | Get a customer |
| `DELETE` | `/api/customers/:id` | Delete a customer |

### Payments

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/payments/intents` | Create a payment intent |
| `GET` | `/api/payments/intents/:id` | Get a payment intent |
| `POST` | `/api/payments/intents/:id/cancel` | Cancel a payment intent |

### Subscriptions

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/subscriptions` | Create a subscription |
| `GET` | `/api/subscriptions` | List subscriptions |
| `GET` | `/api/subscriptions/:id` | Get a subscription |
| `PATCH` | `/api/subscriptions/:id` | Update a subscription |
| `DELETE` | `/api/subscriptions/:id` | Cancel a subscription |

### Webhooks

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/webhooks/stripe` | Stripe webhook receiver |

Stripe webhook events handled: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
