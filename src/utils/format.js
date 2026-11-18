// Utilidades de presentación (fechas, números y nombres) sin dependencias extra.

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** "2026-03-09" o "2026-03-09T10:00:00" -> Date local sin desfase de zona. */
function toDate(value) {  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value);
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3])
    );
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** 9 mar 2026 */
export function fechaCorta(value) {
  const d = toDate(value);
  if (!d) return '—';
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** 08:00 */
export function hora(value) {
  if (!value) return '';
  const parts = String(value).split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : String(value);
}

/** { day: '9', month: 'mar' } para las tarjetas de asistencia. */
export function diaMes(value) {
  const d = toDate(value);
  if (!d) return { day: '—', month: '' };
  return { day: String(d.getDate()), month: MESES[d.getMonth()] };
}

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** "lun", "mar"... para acompañar una fecha. */
export function diaSemana(value) {
  const d = toDate(value);
  return d ? DIAS[d.getDay()] : '';
}

/** "Hoy", "Ayer", "9 mar" según antigüedad. */
export function fechaRelativa(value) {
  const d = toDate(value);
  if (!d) return '—';
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((startToday - startDate) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff > 1 && diff < 7) return `Hace ${diff} días`;
  return fechaCorta(d);
}

/** Date -> "2026-03-09" en hora local (lo que espera el backend). */
export function toApiDate(value) {
  const d = toDate(value);
  if (!d) return null;
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** 15.5 / "15.50" / null -> "15.50" (escala vigesimal). */
export function nota(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toFixed(2);
}

/**
 * Semáforo de rendimiento (CONTEXT.md §"Cálculo de promedios").
 *
 * 🟢 >= 16.00 · 🟡 11.00 – 15.99 · 🔴 < 11.00
 *
 * Es solo presentación: el promedio ya viene calculado por el backend.
 * Devuelve `null` cuando no hay nota, para no pintar un "—" de rojo.
 */
const SEMAFORO = {
  verde: {
    key: 'verde',
    label: 'Destacado',
    rango: '≥ 16',
    emoji: '🟢',
    text: '#047857',
    bg: '#ECFDF5',
    dot: '#10B981',
  },
  ambar: {
    key: 'ambar',
    label: 'En proceso',
    rango: '11 – 15.99',
    emoji: '🟡',
    text: '#B45309',
    bg: '#FFFBEB',
    dot: '#F59E0B',
  },
  rojo: {
    key: 'rojo',
    label: 'Requiere apoyo',
    rango: '< 11',
    emoji: '🔴',
    text: '#B91C1C',
    bg: '#FEF2F2',
    dot: '#EF4444',
  },
};

/** Leyenda ordenada para pintar el semáforo junto a las notas. */
export const SEMAFORO_LEYENDA = [SEMAFORO.verde, SEMAFORO.ambar, SEMAFORO.rojo];

export function semaforoNota(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  if (n >= 16) return SEMAFORO.verde;
  if (n >= 11) return SEMAFORO.ambar;
  return SEMAFORO.rojo;
}

/** 87.5 -> "87.5%" ; 100 -> "100%". */
export function porcentaje(value) {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  const rounded = Math.round(n * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

export function iniciales(...values) {
  const source = values.filter(Boolean).join(' ').trim();
  if (!source) return '?';
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function primerNombre(value, fallback = 'Estudiante') {
  return String(value || '').trim().split(/\s+/)[0] || fallback;
}

export function situacionLabel(value) {
  const map = {
    EN_CURSO: 'En curso',
    APROBADO: 'Aprobado',
    DESAPROBADO: 'Desaprobado',
    RETIRADO: 'Retirado',
  };
  return map[value] || '—';
}

export function parentescoLabel(value) {
  const map = {
    PADRE: 'Padre',
    MADRE: 'Madre',
    TUTOR: 'Tutor',
    HERMANO: 'Hermano',
    OTRO: 'Apoderado',
  };
  return map[value] || 'Apoderado';
}

export function tipoNotificacion(tipo) {
  const map = {
    COMUNICADO: { icon: 'megaphone-outline', label: 'Comunicado' },
    TICKET_RESUELTO: { icon: 'document-text-outline', label: 'Justificación' },
    CALIFICACION: { icon: 'stats-chart-outline', label: 'Calificación' },
    ASISTENCIA: { icon: 'calendar-outline', label: 'Asistencia' },
    MATERIAL: { icon: 'folder-open-outline', label: 'Material' },
    CIERRE: { icon: 'flag-outline', label: 'Cierre de año' },
  };
  return map[tipo] || { icon: 'notifications-outline', label: 'Aviso' };
}
