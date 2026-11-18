import { apiFetch, queryString } from './client';

// Push nativo: el dueño del token sale del JWT, nunca del body.
// La app registra el token en cada login y lo borra al cerrar sesión.

export const misDispositivos = () => apiFetch('/notificaciones/dispositivos');

/** Upsert idempotente del token Expo. plataforma: ANDROID | IOS | WEB. */
export const registrarDispositivo = (token, plataforma) =>
  apiFetch('/notificaciones/dispositivos', {
    method: 'POST',
    body: { token, plataforma },
  });

/** Baja idempotente al cerrar sesión. */
export const eliminarDispositivo = (token) =>
  apiFetch(`/notificaciones/dispositivos${queryString({ token })}`, {
    method: 'DELETE',
  });
