import { http } from './http.js';

export async function loginRequest(email, password) {
  const { data } = await http.post('/auth/login', { email, password });
  return data.data;
}
