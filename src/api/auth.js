import { apiFetch } from './client';
import { saveSession, clearSession } from './token';

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
  // { token, tokenType, expiresIn, user } — user es la cuenta plana.
  await saveSession(data.token, data.user);
  return data;
}

// GET /auth/me -> { usuario, perfil } (el perfil varía por rol:
// DOCENTE trae título+materias; otros roles, perfil null hasta el Módulo 3).
export async function me() {
  return apiFetch('/auth/me');
}

export async function logout() {
  await clearSession();
}
