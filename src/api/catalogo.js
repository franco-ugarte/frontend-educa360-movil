import { apiFetch } from './client';

// Catálogo académico (todo ADMIN según CONTEXT.md §5).
export const listarPeriodos = () => apiFetch('/admin/periodos');
export const listarMaterias = () => apiFetch('/admin/materias');
export const listarSecciones = (periodoId) =>
  apiFetch(periodoId ? `/admin/secciones?periodoId=${periodoId}` : '/admin/secciones');
export const listarCursos = ({ seccionId, docenteId } = {}) => {
  const q = new URLSearchParams();
  if (seccionId) q.set('seccionId', String(seccionId));
  if (docenteId) q.set('docenteId', String(docenteId));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch(`/admin/cursos${qs}`);
};
export const listarHorario = (cursoId) => apiFetch(`/admin/cursos/${cursoId}/horario`);
export const listarMateriasDocente = (docenteId) =>
  apiFetch(`/admin/docentes/${docenteId}/materias`);
