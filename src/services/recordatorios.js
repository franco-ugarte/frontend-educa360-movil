import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { DIAS_SEMANA } from '../utils/horario';
import { hora } from '../utils/format';

/**
 * Recordatorios locales (no push remoto).
 *
 * - Estudiante y apoderado: aviso semanal 10 minutos antes de cada bloque.
 * - Docente: aviso antes de cada clase y recordatorio de asistencia por la
 *   mañana en los días que tiene horario.
 *
 * Funciona en Expo Go (los push remotos no desde SDK 53 en Android, los
 * locales sí). Todo se cancela y reprograma cuando cambia el horario, y se
 * apaga desde Perfil sin tocar las notificaciones que envía el backend.
 */

const PREF = '@educa360:recordatorios';
const ORIGEN = 'educa360-recordatorio';
const CANAL = 'recordatorios';

const DIAS = {
  DOMINGO: 1,
  LUNES: 2,
  MARTES: 3,
  MIERCOLES: 4,
  JUEVES: 5,
  VIERNES: 6,
  SABADO: 7,
};

const HORA_ASISTENCIA = 6 * 60 + 45; // 06:45, antes del primer bloque
const MAX_PROGRAMADAS = 40;

function nativo() {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

function minutoDeHora(valor) {
  const [h, m] = String(valor || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

async function asegurarCanal() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Recordatorios de clase',
    description: 'Avisos de clase y de asistencia generados por la app.',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#5F348F',
  });
}

function permisoConcedido(estado) {
  return (
    !!estado?.granted ||
    estado?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function pedirPermiso() {
  await asegurarCanal();
  const actual = await Notifications.getPermissionsAsync();
  if (permisoConcedido(actual)) return true;
  if (actual?.canAskAgain === false) return false;
  const pedido = await Notifications.requestPermissionsAsync();
  return permisoConcedido(pedido);
}

/** Primera vez: pide permiso. Después respeta la elección guardada. */
let preparando = null;

export function prepararRecordatorios() {
  if (!nativo()) return Promise.resolve(false);
  if (!preparando) {
    preparando = _preparar().finally(() => {
      preparando = null;
    });
  }
  return preparando;
}

async function _preparar() {
  try {
    const pref = await AsyncStorage.getItem(PREF);
    if (pref === '0') return false;
    if (pref === '1') return true;
    const ok = await pedirPermiso();
    await AsyncStorage.setItem(PREF, ok ? '1' : '0');
    return ok;
  } catch {
    return false;
  }
}

/** Estado para el interruptor de Perfil. */
export async function estadoRecordatorios() {
  if (!nativo()) return { disponible: false, activo: false, permiso: false };
  try {
    const pref = await AsyncStorage.getItem(PREF);
    const actual = await Notifications.getPermissionsAsync();
    const permiso = permisoConcedido(actual);
    return { disponible: true, activo: pref === '1' && permiso, permiso };
  } catch {
    return { disponible: true, activo: false, permiso: false };
  }
}

/** Enciende: pide permiso y guarda la preferencia. */
export async function activarRecordatorios() {
  if (!nativo()) return { ok: false, motivo: 'plataforma' };
  try {
    const ok = await pedirPermiso();
    await AsyncStorage.setItem(PREF, ok ? '1' : '0');
    return { ok, motivo: ok ? null : 'permiso' };
  } catch {
    return { ok: false, motivo: 'error' };
  }
}

/** Apaga y borra solo los recordatorios de la app. */
export async function desactivarRecordatorios() {
  await AsyncStorage.setItem(PREF, '0');
  await cancelarRecordatorios();
}

/** Cancela los recordatorios propios (no toca los push del backend). */
export async function cancelarRecordatorios() {
  if (!nativo()) return;
  try {
    const programadas = await Notifications.getAllScheduledNotificationsAsync();
    const nuestras = (programadas || []).filter(
      (item) => item?.content?.data?.origen === ORIGEN
    );
    await Promise.all(
      nuestras.map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier)
      )
    );
  } catch {
    // Si el sistema no deja leer las programadas, no se rompe la app.
  }
}

function triggerSemanal(dia, minutos) {
  const weekday = DIAS[dia] || DIAS_SEMANA.indexOf(dia) + 1;
  if (!weekday) return null;
  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday,
    hour: Math.floor(minutos / 60),
    minute: minutos % 60,
  };
  if (Platform.OS === 'android') trigger.channelId = CANAL;
  return trigger;
}

async function programarClase({ bloque, rol, nombre, seccionEtiqueta }) {
  const inicio = minutoDeHora(bloque.horaInicio);
  if (inicio === null) return null;
  const aviso = inicio - 10;
  if (aviso < 0) return null;

  const trigger = triggerSemanal(bloque.dia, aviso);
  if (!trigger) return null;

  const materia = bloque.materiaNombre || 'Clase';
  const rango = `${hora(bloque.horaInicio)} – ${hora(bloque.horaFin)}`;
  const seccion = seccionEtiqueta ? ` · ${seccionEtiqueta}` : '';

  let title = 'Clase en 10 minutos';
  let body = `${materia} · ${rango}${seccion}`;

  if (rol === 'DOCENTE') {
    title = `Clase en 10 min · ${materia}`;
    body = `${seccionEtiqueta || 'Tu sección'} · ${rango}`;
  } else if (rol === 'APODERADO') {
    title = `${nombre || 'Tu hijo'}: clase en 10 min`;
    body = `${materia} · ${rango}${seccion}`;
  }

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { origen: ORIGEN, tipo: 'RECORDATORIO', ruta: 'horario' },
      },
      trigger,
    });
  } catch {
    return null;
  }
}

async function programarAsistencia({ dia, cantidad }) {
  const trigger = triggerSemanal(dia, HORA_ASISTENCIA);
  if (!trigger) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Asistencia pendiente',
        body: `Hoy tienes ${cantidad} ${
          cantidad === 1 ? 'bloque' : 'bloques'
        } de clase. Registra la asistencia desde la app.`,
        sound: 'default',
        data: { origen: ORIGEN, tipo: 'RECORDATORIO', ruta: 'asistencia' },
      },
      trigger,
    });
  } catch {
    return null;
  }
}

/**
 * Reprograma los recordatorios del rol con el horario actual.
 * Devuelve cuántos quedaron programados (0 si están apagados o sin permiso).
 */
let colaSincronizacion = Promise.resolve();

export function sincronizarRecordatorios(opciones = {}) {
  colaSincronizacion = colaSincronizacion
    .then(() => _sincronizar(opciones))
    .catch(() => 0);
  return colaSincronizacion;
}

async function _sincronizar({
  rol,
  horario = [],
  cursos = [],
  nombre,
  seccion,
} = {}) {
  if (!nativo()) return 0;
  try {
    const pref = await AsyncStorage.getItem(PREF);
    if (pref !== '1') return 0;

    const permiso = await Notifications.getPermissionsAsync();
    if (!permisoConcedido(permiso)) return 0;

    await asegurarCanal();
    await cancelarRecordatorios();

    const bloques = (horario || []).filter(
      (bloque) => bloque?.dia && DIAS[bloque.dia] && bloque?.horaInicio
    );

    const seccionDe = (bloque) => {
      if (bloque.seccionEtiqueta) return bloque.seccionEtiqueta;
      const curso = (cursos || []).find((item) => item.id === bloque.cursoId);
      return curso?.seccionEtiqueta || seccion || null;
    };

    const tareas = [];
    bloques.slice(0, MAX_PROGRAMADAS).forEach((bloque) => {
      tareas.push(
        programarClase({
          bloque,
          rol,
          nombre,
          seccionEtiqueta: seccionDe(bloque),
        })
      );
    });

    if (rol === 'DOCENTE' && bloques.length) {
      const porDia = new Map();
      bloques.forEach((bloque) => {
        porDia.set(bloque.dia, (porDia.get(bloque.dia) || 0) + 1);
      });
      [...porDia.entries()].slice(0, 6).forEach(([dia, cantidad]) => {
        tareas.push(programarAsistencia({ dia, cantidad }));
      });
    }

    const ids = await Promise.all(tareas);
    return ids.filter(Boolean).length;
  } catch {
    // Un fallo de notificaciones nunca debe romper la carga de datos.
    return 0;
  }
}

/** Notificación inmediata para comprobar permisos y diseño. */
export async function enviarRecordatorioPrueba() {
  if (!nativo()) return false;
  try {
    await asegurarCanal();
    const permiso = await Notifications.getPermissionsAsync();
    if (!permisoConcedido(permiso)) return false;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorios activos',
        body: 'Así se verán los avisos de Educa360 en tu teléfono.',
        sound: 'default',
        data: { origen: ORIGEN, tipo: 'RECORDATORIO', ruta: 'horario' },
      },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}
