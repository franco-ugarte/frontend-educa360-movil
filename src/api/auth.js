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

/**
 * PATCH /auth/me/telefonos -> reemplaza los teléfonos del propio usuario.
 * La lista enviada es la que queda (`[]` los quita). Máximo 5, formato
 * `\+?\d{7,15}`. ESTUDIANTE recibe 403: sus contactos los gestiona su apoderado.
 * Devuelve el mismo `MeResponse` que `GET /auth/me`.
 */
export async function actualizarTelefonos(telefonos) {
  return apiFetch('/auth/me/telefonos', {
    method: 'PATCH',
    body: { telefonos },
  });
}

export async function logout() {
  await clearSession();
}
