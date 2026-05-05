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
cp .env.example .env
```

Ensure `client/.env` points at the API:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

Open the printed URL (typically `http://localhost:5173`).

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
| `JWT_SECRET`| Secret for signing JWT access tokens |

### `client/.env`

| Variable       | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | Base URL of the Express API    |

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

- Deploy the **server** to Render, Railway, Fly.io, etc., with `MONGO_URI` and `JWT_SECRET` set.
- Deploy the **client** static build (`npm run build` in `client/`) to Netlify or Vercel; set `VITE_API_URL` to the public API URL and configure CORS on the API if origins differ.

## Assumptions

- Single-region MVP; JWT expires in 8 hours.
- Vendor “minimal CRUD” implemented as list + create (no edit/delete) per assignment scope.
- Database name in `MONGO_URI` determines the database used (replace the path segment before `?`).
