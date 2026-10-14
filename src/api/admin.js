import { apiFetch } from './client';

// Zona ADMIN: /api/v1/admin/usuarios + personal.
export const listarUsuarios = (params = {}) => {
  const q = new URLSearchParams();
  if (params.rol) q.set('rol', params.rol);
  if (params.activo !== undefined) q.set('activo', String(params.activo));
  if (params.q) q.set('q', params.q);
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch(`/admin/usuarios${qs}`);
};

export const crearAdmin = (usuario) =>
  apiFetch('/admin/usuarios', { method: 'POST', body: usuario });

export const crearDocente = (usuario, perfil = {}) =>
  apiFetch('/admin/docentes', { method: 'POST', body: { usuario, perfil } });

export const crearSecretaria = (usuario, perfil = {}) =>
  apiFetch('/admin/secretarias', { method: 'POST', body: { usuario, perfil } });

export const cambiarActivo = (id, activo) =>
  apiFetch(`/admin/usuarios/${id}/activo`, { method: 'PATCH', body: { activo } });

export const resetPassword = (id, password) =>
  apiFetch(`/admin/usuarios/${id}/password`, { method: 'PATCH', body: { password } });
