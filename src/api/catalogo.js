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
// Zona DOCENTE: sus cursos (identidad del token, sin filtros).
export const misCursos = () => apiFetch('/docente/cursos');
// Zona ESTUDIANTE: los cursos de SU sección (vacío si aún sin matrícula).
export const misCursosEstudiante = () => apiFetch('/estudiante/cursos');
// Zona APODERADO: SUS hijos con sección del periodo vigente.
export const misHijos = () => apiFetch('/apoderado/hijos');
// Panel ADMIN: docentes con id de PERFIL + título + habilitadas.
export const listarDocentes = () => apiFetch('/admin/docentes');

// ---- Mutaciones del catálogo (todo ADMIN) ----
export const crearPeriodo = (data) => apiFetch('/admin/periodos', { method: 'POST', body: data });
export const editarPeriodo = (id, data) => apiFetch(`/admin/periodos/${id}`, { method: 'PUT', body: data });
export const cambiarEstadoPeriodo = (id, estado) =>
  apiFetch(`/admin/periodos/${id}/estado`, { method: 'PATCH', body: { estado } });

export const crearMateria = (data) => apiFetch('/admin/materias', { method: 'POST', body: data });
export const editarMateria = (id, data) => apiFetch(`/admin/materias/${id}`, { method: 'PUT', body: data });
export const setMateriaActiva = (id, activa) =>
  apiFetch(`/admin/materias/${id}/activa`, { method: 'PATCH', body: { activa } });

export const crearSeccion = (data) => apiFetch('/admin/secciones', { method: 'POST', body: data });
export const editarSeccion = (id, data) => apiFetch(`/admin/secciones/${id}`, { method: 'PUT', body: data });

export const habilitarMaterias = (docentePerfilId, materiaIds) =>
  apiFetch(`/admin/docentes/${docentePerfilId}/materias`, { method: 'PUT', body: { materiaIds } });

export const crearCurso = (data) => apiFetch('/admin/cursos', { method: 'POST', body: data });
export const eliminarCurso = (id) => apiFetch(`/admin/cursos/${id}`, { method: 'DELETE' });
export const reemplazarHorario = (cursoId, bloques) =>
  apiFetch(`/admin/cursos/${cursoId}/horario`, { method: 'PUT', body: { bloques } });
