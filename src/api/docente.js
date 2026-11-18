import { apiFetch, queryString } from './client';

// Zona DOCENTE: la identidad y la titularidad de los cursos salen del token.
// Los endpoints con {cursoId} responden 404 si el curso no es del docente.

/** Cursos que dicta el docente autenticado. */
export const misCursos = () => apiFetch('/docente/cursos');

/** Su semana completa (todos los cursos) en una sola petición. */
export const miHorario = () => apiFetch('/docente/horario');

/** Hoja de asistencia de un bloque en una fecha. */
export const asistenciaClase = (cursoId, { bloqueId, fecha } = {}) =>
  apiFetch(
    `/docente/cursos/${cursoId}/asistencia${queryString({ bloqueId, fecha })}`
  );

/** Upsert parcial: solo viajan los alumnos que se registran o corrigen. */
export const registrarAsistencia = (cursoId, body) =>
  apiFetch(`/docente/cursos/${cursoId}/asistencia`, { method: 'PUT', body });

/**
 * Avance de asistencia de todos sus bloques en una fecha.
 * Devuelve { fecha, dia, totalBloques, bloquesCompletos, bloques: [...] }.
 */
export const resumenAsistencia = ({ fecha } = {}) =>
  apiFetch(`/docente/asistencias/resumen${queryString({ fecha })}`);

/** Comunicados generales y de sus secciones (donde dicta clase o es tutor). */
export const misComunicados = ({ anioId, seccionId } = {}) =>
  apiFetch(`/docente/comunicados${queryString({ anioId, seccionId })}`);

/** Publica un aviso en una de sus secciones. */
export const crearComunicado = (body) =>
  apiFetch('/docente/comunicados', { method: 'POST', body });

/** Edita un aviso propio. */
export const actualizarComunicado = (id, body) =>
  apiFetch(`/docente/comunicados/${id}`, { method: 'PUT', body });

/** Baja lógica de un aviso propio. */
export const eliminarComunicado = (id) =>
  apiFetch(`/docente/comunicados/${id}`, { method: 'DELETE' });
