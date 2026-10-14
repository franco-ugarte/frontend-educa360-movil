import { apiFetch } from './client';

// Zona SECRETARIA (ADMIN es superconjunto): altas de alumnos y familias.
export const crearEstudiante = (usuario, perfil) =>
  apiFetch('/secretaria/estudiantes', { method: 'POST', body: { usuario, perfil } });

export const crearApoderado = (usuario, perfil = {}) =>
  apiFetch('/secretaria/apoderados', { method: 'POST', body: { usuario, perfil } });

// Módulo 3: listados con ficha completa (sección, matrícula, apoderados).
export const listarEstudiantes = ({ q, estado } = {}) => {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  if (estado) p.set('estado', estado);
  const qs = p.toString() ? `?${p.toString()}` : '';
  return apiFetch(`/secretaria/estudiantes${qs}`);
};

export const listarApoderados = (q) =>
  apiFetch(q ? `/secretaria/apoderados?q=${encodeURIComponent(q)}` : '/secretaria/apoderados');

export const vincularRepresentado = (apoderadoPerfilId, { estudianteId, parentesco, responsablePrincipal }) =>
  apiFetch(`/secretaria/apoderados/${apoderadoPerfilId}/representados`, {
    method: 'POST', body: { estudianteId, parentesco, responsablePrincipal },
  });

export const desvincularRepresentado = (apoderadoPerfilId, estudianteId) =>
  apiFetch(`/secretaria/apoderados/${apoderadoPerfilId}/representados/${estudianteId}`, { method: 'DELETE' });

// Matrículas: nacen PENDIENTE; solo Secretaría las pasa a PAGADO.
export const crearMatricula = (estudianteId, seccionId) =>
  apiFetch('/secretaria/matriculas', { method: 'POST', body: { estudianteId, seccionId } });

export const cambiarEstadoMatricula = (matriculaId, estado) =>
  apiFetch(`/secretaria/matriculas/${matriculaId}/estado`, { method: 'PATCH', body: { estado } });
