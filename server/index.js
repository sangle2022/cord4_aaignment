import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { configureCors } from './config/cors.js';
import { validateEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimits.js';
import authRoutes from './routes/authRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import { sendError } from './utils/apiResponse.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(configureCors());

app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || '100kb',
    strict: true,
  })
);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use(apiLimiter);

app.use('/auth', authRoutes);
app.use('/vendors', vendorRoutes);
app.use('/payouts', payoutRoutes);

app.use((req, res) => {
  sendError(res, 'Route not found', 404);
});

app.use(errorHandler);

let server;

async function start() {
  validateEnv();
  await connectDatabase();
  server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received, closing HTTP server…`);
  if (!server) {
    process.exit(0);
    return;
  }
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB:', err);
    }
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
