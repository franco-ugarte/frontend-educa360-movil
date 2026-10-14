import { apiFetch } from './client';
import { saveSession, clearSession } from './token';

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
  // { token, tokenType, expiresIn, user }
  await saveSession(data.token, data.user);
  return data;
}

export async function me() {
  return apiFetch('/auth/me');
}

export async function logout() {
  await clearSession();
}
