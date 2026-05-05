import axios from 'axios';

/**
 * Production / explicit: set VITE_API_URL (e.g. https://api.example.com).
 * Local dev: omit VITE_API_URL to use `/api` — Vite proxies to the Express server
 * without colliding with SPA routes (/payouts, /vendors, etc.).
 */
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    const payload = err.response?.data;
    const msg = payload?.message;
    if (typeof msg === 'string') {
      return msg;
    }
    if (Array.isArray(payload?.details) && payload.details.length > 0) {
      const first = payload.details[0];
      if (typeof first?.msg === 'string') {
        return first.msg;
      }
    }
    return err.message || 'Request failed';
  }
  return 'Unexpected error';
}
