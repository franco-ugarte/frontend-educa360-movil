/**
 * Enrutado de notificaciones push.
 *
 * El backend envía en `data` de la notificación:
 *   { notificacionId, tipo, referenciaId }
 * y `referenciaId` apunta al registro concreto (ver docs/MOVIL.md):
 *   COMUNICADO -> comunicadoId, TICKET_RESUELTO -> ticketId,
 *   CALIFICACION -> calificacionId, ASISTENCIA -> asistenciaId,
 *   MATERIAL -> materialId, CIERRE -> anioId.
 *
 * El móvil no tiene una pantalla de detalle por registro, así que se abre la
 * sección equivalente. Si falta `referenciaId` o el tipo no aplica al rol, se
 * abre la bandeja de notificaciones.
 */

const DESTINOS = {
  ESTUDIANTE: {
    COMUNICADO: { overlay: 'comunicados' },
    CALIFICACION: { tab: 'notas' },
    ASISTENCIA: { tab: 'asistencia' },
    CIERRE: { tab: 'notas' },
  },
  APODERADO: {
    COMUNICADO: { overlay: 'comunicados' },
    TICKET_RESUELTO: { tab: 'justificar' },
    CALIFICACION: { tab: 'notas' },
    ASISTENCIA: { tab: 'asistencia' },
    CIERRE: { tab: 'notas' },
  },
  DOCENTE: {
    COMUNICADO: { tab: 'avisos' },
    ASISTENCIA: { tab: 'asistencia' },
  },
};

/** Datos que viajan dentro del push (`content.data`). */
export function datosDePush(respuesta) {
  return respuesta?.notification?.request?.content?.data || null;
}

/**
 * Destino al tocar un push: `{ tab }`, `{ overlay }` o `null` para la bandeja.
 *
 * Los recordatorios locales no traen `referenciaId` (no apuntan a un registro
 * del backend): se enrutan por `data.ruta` a la pestaña que corresponde.
 */
export function destinoNotificacion(data, rol) {
  if (!data) return null;

  const tipo = data.tipo ? String(data.tipo).toUpperCase() : null;

  if (tipo === 'RECORDATORIO') {
    const permitidas = {
      ESTUDIANTE: ['horario'],
      APODERADO: ['horario'],
      DOCENTE: ['horario', 'asistencia'],
    };
    const ruta = String(data.ruta || '');
    return (permitidas[rol] || []).includes(ruta) ? { tab: ruta } : null;
  }

  const referenciaId = data.referenciaId;
  if (referenciaId === null || referenciaId === undefined) return null;

  const mapa = DESTINOS[rol] || {};
  return (tipo && mapa[tipo]) || null;
}
