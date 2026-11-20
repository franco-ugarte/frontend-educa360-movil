import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import {
  eliminarDispositivo,
  misDispositivos,
  registrarDispositivo,
} from '../api/dispositivos';

/**
 * Notificaciones locales y push nativo con Expo.
 *
 * - El token se registra en el backend al iniciar sesión y se borra al salir.
 * - Sin `extra.eas.projectId` (o en simulador) no se intenta registrar; la app
 *   sigue funcionando con el refresco del contador cada minuto.
 * - En Android los canales se crean antes de pedir permisos y antes de pedir el
 *   token. Con `DEFAULT` el aviso no salta como banner: se usa `MAX`.
 */

const CANAL_DEFAULT = 'default';
const CANAL_RECORDATORIOS = 'recordatorios';

let tokenRegistrado = null;

// Se guarda en AsyncStorage para poder borrarlo tras reiniciar la app.
const K_PUSH_TOKEN = '@educa360:pushToken';

async function configurarCanal(id, config) {
  const actual = await Notifications.getNotificationChannelAsync(id);
  // Android no deja cambiar la importance de un canal ya creado: si quedó con
  // el valor antiguo (DEFAULT) se recrea para que el banner vuelva a saltar.
  if (actual && actual.importance !== config.importance) {
    await Notifications.deleteNotificationChannelAsync(id);
  }
  await Notifications.setNotificationChannelAsync(id, config);
}

/** Canales de Android listos antes de cualquier solicitud de permiso. */
export async function asegurarCanalesNotificaciones() {
  if (Platform.OS !== 'android') return;
  await configurarCanal(CANAL_DEFAULT, {
    name: 'Notificaciones Educa360',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6D28D9',
  });
  await configurarCanal(CANAL_RECORDATORIOS, {
    name: 'Recordatorios de clase',
    description: 'Avisos de clase y de asistencia generados por la app.',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6D28D9',
  });
}

function permisoConcedido(estado) {
  return (
    !!estado?.granted || estado?.ios?.status === IosAuthorizationStatus.PROVISIONAL
  );
}

/** Estado del permiso y si todavía se le puede preguntar al usuario. */
export async function permisoNotificaciones() {
  const actual = await Notifications.getPermissionsAsync();
  if (permisoConcedido(actual)) return { granted: true, canAskAgain: true };
  if (actual?.canAskAgain === false) return { granted: false, canAskAgain: false };
  const pedido = await Notifications.requestPermissionsAsync();
  return {
    granted: permisoConcedido(pedido),
    canAskAgain: pedido?.canAskAgain !== false,
  };
}

/** Disparo inmediato; en Android 8+ el canal efectivo va en el trigger. */
export async function notificarLocal({
  title,
  body,
  data = {},
  channelId = CANAL_DEFAULT,
}) {
  if (Platform.OS === 'android') await asegurarCanalesNotificaciones();
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, channelId, data },
    trigger: Platform.OS === 'android' ? { channelId } : null,
  });
}

export function configurarPush() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  // Arranca antes de cualquier petición de permiso para que el canal exista.
  asegurarCanalesNotificaciones().catch(() => {});
}

function projectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    null
  );
}

function plataforma() {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return 'WEB';
}

/** Pide permisos, obtiene el token Expo y lo registra. Devuelve el token o null. */
export async function registrarPushToken() {
  try {
    if (!Device.isDevice) return null;

    // Orden obligatorio en Android: canal -> permiso -> token.
    await asegurarCanalesNotificaciones();

    const permiso = await permisoNotificaciones();
    if (!permiso.granted) return null;

    const id = projectId();
    if (!id) {
      // Proyecto Expo sin EAS: no hay token remoto, pero la app sigue viva.
      return null;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: id });
    if (!data) return null;

    await registrarDispositivo(data, plataforma());
    tokenRegistrado = data;
    await AsyncStorage.setItem(K_PUSH_TOKEN, data);
    return data;
  } catch (error) {
    // Expo Go / simulador / sin red: el push es opcional, nunca rompe el login.
    console.warn('Push: no se pudo registrar el dispositivo.', error?.message || error);
    return null;
  }
}

/** Borra el token del backend antes de cerrar sesión. Nunca lanza. */
export async function eliminarPushToken() {
  try {
    let token = tokenRegistrado || (await AsyncStorage.getItem(K_PUSH_TOKEN));
    if (!token) {
      const lista = await misDispositivos();
      token = Array.isArray(lista) ? lista[0]?.token : lista?.token;
    }
    if (token) await eliminarDispositivo(token);
    tokenRegistrado = null;
    await AsyncStorage.removeItem(K_PUSH_TOKEN);
  } catch {
    // El logout no debe fallar por un problema de push.
  }
}

/** Avisa cuando llega una notificación con la app abierta. */
export function alRecibirPush(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/** Avisa cuando el usuario toca una notificación. */
export function alResponderPush(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

let inicialConsumida = false;

/**
 * Respuesta que abrió la app desde cero (app cerrada y push tocado).
 * Se consume una sola vez para no reabrir la bandeja en cada montaje.
 */
export async function consumirPushInicial() {
  if (inicialConsumida) return null;
  inicialConsumida = true;
  try {
    return await Notifications.getLastNotificationResponseAsync();
  } catch {
    return null;
  }
}
