import { apiFetch, queryString } from './client';

// Bandeja del usuario autenticado: el destinatario sale del token.
export const misNotificaciones = (leida) =>
  apiFetch(`/notificaciones${queryString({ leida })}`);

export const contadorNoLeidas = () => apiFetch('/notificaciones/contador');

export const marcarLeida = (id) =>
  apiFetch(`/notificaciones/${id}/leida`, { method: 'PATCH' });

export const marcarTodasLeidas = () =>
  apiFetch('/notificaciones/leidas', { method: 'PATCH' });
