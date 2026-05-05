# Payout Management MVP

Full-stack monorepo for creating vendor records, managing payout requests with enforced status transitions, and auditing every payout action. Roles (**OPS** vs **FINANCE**) are enforced only on the API using JWT claims—never trust a role sent from the browser.

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 18 (Vite), React Query, Axios, React Hook Form, Yup, React Toastify |
| Backend  | Node.js, Express, Mongoose (MongoDB), JWT, bcrypt |
| Data     | MongoDB Atlas (collections: `users`, `vendors`, `payouts`, `payout_audits`) |

**Why Vite + React (not Next.js):** The MVP is a JWT-authenticated SPA calling a REST API; your environment template uses `VITE_API_URL`, and a Vite app keeps routing and API wiring straightforward without adding SSR complexity.

## Repository layout

```
root/
├── client/    → Vite + React UI
├── server/    → Express API
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas cluster (or local MongoDB) and connection string

## Run in under 5 minutes

### 1. Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASS@cluster/host/DATABASE_NAME?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_secret_in_production
```

Install, seed demo users, start:

```bash
npm install
npm run seed
npm run dev
```

API base: `http://localhost:5000` (health: `GET /health`).

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open the printed URL (typically `http://localhost:5173`). **No `.env` is required for local dev:** the app calls `/api/...` and Vite proxies that to `http://localhost:5000`, so refreshing routes like `/payouts` still loads the SPA (it does not collide with `GET /payouts` on the API).

Optional `client/.env`: set `VITE_API_URL=https://your-production-api.com` for deployed builds that talk to a remote API directly.

### 3. Sign in (seeded users)

| Email             | Password | Role    |
|-------------------|----------|---------|
| ops@demo.com      | ops123   | OPS     |
| finance@demo.com  | fin123   | FINANCE |

## Seed instructions

- **Users:** `npm run seed` from `server/` creates or updates the two demo users above (idempotent upsert by email).
- **Vendors / payouts:** Add vendors and payouts via the UI after login.

## Environment variables

### `server/.env`

| Variable    | Description                          |
|-------------|--------------------------------------|
| `PORT`      | HTTP port (default `5000`)          |
| `MONGO_URI` | MongoDB connection string           |
| `JWT_SECRET`| Secret for signing JWT access tokens (min 16 chars; **min 32 in production**) |
| `CORS_ORIGINS` | Optional comma-separated browser origins (e.g. `http://localhost:5173`). If unset, any origin is allowed — set this when deploying. |
| `TRUST_PROXY` | Set to `true` when behind a reverse proxy so rate limits use the real client IP. |
| `RATE_LIMIT_MAX` | Max API requests per IP per 15 minutes (default 400). |
| `LOGIN_RATE_LIMIT_MAX` | Max login attempts per IP per 15 minutes (default 30). |
| `JSON_BODY_LIMIT` | Max JSON body size (default `100kb`). |

### `client/.env`

| Variable       | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | Optional. Full API origin for production builds (e.g. `https://api.example.com`). If unset in dev, the app uses `/api` and Vite proxies to the backend. |

## API overview

All `/vendors` and `/payouts` routes require `Authorization: Bearer <token>` from `POST /auth/login`.

| Method | Path                     | Role    | Description |
|--------|--------------------------|---------|-------------|
| POST   | `/auth/login`            | —       | Login; returns JWT + user (`OPS` / `FINANCE`) |
| GET    | `/vendors`               | Auth    | List vendors |
| POST   | `/vendors`               | Auth    | Create vendor |
| GET    | `/payouts`               | Auth    | List payouts; optional query `status`, `vendor_id` |
| POST   | `/payouts`               | **OPS** | Create payout (`Draft`) |
| GET    | `/payouts/:id`           | Auth    | Payout detail + audit trail |
| POST   | `/payouts/:id/submit`    | **OPS** | `Draft` → `Submitted` |
| POST   | `/payouts/:id/approve`   | **FINANCE** | `Submitted` → `Approved` |
| POST   | `/payouts/:id/reject`    | **FINANCE** | `Submitted` → `Rejected` (JSON body: `{ "reason": "..." }`) |

**Responses:** Success: `{ "success": true, "data": ... }`. Error: `{ "success": false, "message": "...", "details": ... }` (HTTP 4xx/5xx).

## Business rules (server-enforced)

- **OPS:** create payouts (always start in `Draft`), submit `Draft` → `Submitted`, view payouts/vendors.
- **FINANCE:** approve or reject only when status is `Submitted`; rejection requires a reason; view payouts/vendors.
- Invalid transitions (e.g. approve from `Draft`) return **400**.
- Every create/submit/approve/reject writes an audit row (`CREATED`, `SUBMITTED`, `APPROVED`, `REJECTED`) with actor and timestamp.

## Deployment notes

### API (e.g. Render)

Set these in the Render **Environment** tab:

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | At least **32 characters** in production (Render sets `NODE_ENV=production`) |
| `CORS_ORIGINS` | Recommended | Your frontend URLs, comma-separated, e.g. `https://myapp.onrender.com,https://myapp.vercel.app`. If omitted, the server still starts; you will see a security warning and browsers from any origin may call the API. |

Optional: `TRUST_PROXY=true` so rate limiting uses the real client IP behind Render’s proxy.

Set **Root Directory** to `server` (or use a start command that runs from `server/`). **Start Command:** `npm start`.

### Frontend

Build with `VITE_API_URL=https://your-api.onrender.com` (your live API URL), then deploy `client/dist` to Netlify or Vercel.

## Assumptions

- Single-region MVP; JWT expires in 8 hours.
- Vendor “minimal CRUD” implemented as list + create (no edit/delete) per assignment scope.
- Database name in `MONGO_URI` determines the database used (replace the path segment before `?`).
