import { http } from './http.js';

export async function fetchVendors() {
  const { data } = await http.get('/vendors');
  return data.data.vendors;
}

export async function createVendorRequest(payload) {
  const { data } = await http.post('/vendors', payload);
  return data.data.vendor;
}
