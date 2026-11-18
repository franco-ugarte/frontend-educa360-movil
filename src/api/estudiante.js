import { apiFetch, queryString } from './client';

// Zona ESTUDIANTE: la identidad sale del token, nunca del request.

/** Matrícula y sección del año vigente. 404 si aún no está matriculado. */
export const miMatricula = () => apiFetch('/estudiante/matricula');

/** Cursos de su sección vigente (lista vacía si no hay matrícula). */
export const misCursos = () => apiFetch('/estudiante/cursos');

/** Horario semanal de su sección vigente (lista vacía si no hay matrícula). */
export const miHorario = () => apiFetch('/estudiante/horario');

/** Notas + promedios. Sin filtros = año vigente completo. */
export const misCalificaciones = ({ anioId, bimestreId } = {}) =>
  apiFetch(`/estudiante/calificaciones${queryString({ anioId, bimestreId })}`);

/** Asistencias + resumen. Sin filtros = año vigente completo. */
export const misAsistencias = ({ anioId, bimestreId } = {}) =>
  apiFetch(`/estudiante/asistencias${queryString({ anioId, bimestreId })}`);

/** Comunicados generales y de su sección. */
export const misComunicados = () => apiFetch('/estudiante/comunicados');
