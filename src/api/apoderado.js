import { apiFetch, apiUpload, queryString } from './client';

// Zona APODERADO: el vínculo con el hijo y la identidad salen del token.
// Los endpoints con {hijoId} validan que el alumno esté vinculado y activo.

/** Hijos vinculados, con su sección del año vigente (null si aún sin matrícula). */
export const misHijos = () => apiFetch('/apoderado/hijos');

/** Horario semanal del hijo vinculado (lista vacía si no hay matrícula). */
export const horarioHijo = (hijoId) =>
  apiFetch(`/apoderado/hijos/${hijoId}/horario`);

/** Notas y promedios del hijo. Sin bimestreId = año completo. */
export const calificacionesHijo = (hijoId, { anioId, bimestreId } = {}) =>
  apiFetch(
    `/apoderado/hijos/${hijoId}/calificaciones${queryString({ anioId, bimestreId })}`
  );

/** Asistencias y resumen del hijo. Sin bimestreId = año completo. */
export const asistenciasHijo = (hijoId, { anioId, bimestreId } = {}) =>
  apiFetch(
    `/apoderado/hijos/${hijoId}/asistencias${queryString({ anioId, bimestreId })}`
  );

/** Historial de justificaciones del hijo, filtrable por año y estado. */
export const ticketsHijo = (hijoId, { anioId, estado } = {}) =>
  apiFetch(`/apoderado/hijos/${hijoId}/tickets${queryString({ anioId, estado })}`);

/** Crea un ticket PENDIENTE. Sin bloqueId cubre el día completo. */
export const crearTicket = (hijoId, body) =>
  apiFetch(`/apoderado/hijos/${hijoId}/tickets`, { method: 'POST', body });

/** Adjunta o reemplaza el sustento mientras el ticket está PENDIENTE. */
export const subirSustento = (ticketId, formData) =>
  apiUpload(`/apoderado/tickets/${ticketId}/sustento`, formData);

/** URL firmada (5 min) para ver el sustento adjunto. */
export const urlSustento = (ticketId) =>
  apiFetch(`/apoderado/tickets/${ticketId}/sustento`);

/** Comunicados generales y de la sección de cada hijo activo. */
export const misComunicados = () => apiFetch('/apoderado/comunicados');
