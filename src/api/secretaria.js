import { apiFetch } from './client';

// Zona SECRETARIA (ADMIN es superconjunto): altas de alumnos y familias.
export const crearEstudiante = (usuario, perfil) =>
  apiFetch('/secretaria/estudiantes', { method: 'POST', body: { usuario, perfil } });

export const crearApoderado = (usuario, perfil = {}) =>
  apiFetch('/secretaria/apoderados', { method: 'POST', body: { usuario, perfil } });
