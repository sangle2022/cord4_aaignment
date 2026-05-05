import { http } from './http.js';

export async function fetchPayouts(params) {
  const { data } = await http.get('/payouts', { params });
  return data.data.payouts;
}

export async function createPayoutRequest(payload) {
  const { data } = await http.post('/payouts', payload);
  return data.data.payout;
}

export async function fetchPayoutDetail(id) {
  const { data } = await http.get(`/payouts/${id}`);
  return data.data;
}

export async function submitPayoutRequest(id) {
  const { data } = await http.post(`/payouts/${id}/submit`);
  return data.data.payout;
}

export async function approvePayoutRequest(id) {
  const { data } = await http.post(`/payouts/${id}/approve`);
  return data.data.payout;
}

export async function rejectPayoutRequest(id, reason) {
  const { data } = await http.post(`/payouts/${id}/reject`, { reason });
  return data.data.payout;
}
