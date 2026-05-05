import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

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
