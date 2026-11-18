import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  eliminarDispositivo,
  misDispositivos,
  registrarDispositivo,
} from '../api/dispositivos';

/**
 * Push nativo con Expo.
 *
 * - El token se registra en el backend al iniciar sesión y se borra al salir.
 * - Sin `extra.eas.projectId` (o en simulador) no se intenta registrar; la app
 *   sigue funcionando con el refresco del contador cada minuto.
 * - En Android el canal debe existir antes de pedir el token.
 */

let tokenRegistrado = null;

// Se guarda en AsyncStorage para poder borrarlo tras reiniciar la app.
const K_PUSH_TOKEN = '@educa360:pushToken';

export function configurarPush() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
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

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Avisos de Educa360',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5F348F',
      });
    }

    const actual = await Notifications.getPermissionsAsync();
    let estado = actual.status;
    if (estado !== 'granted') {
      const pedido = await Notifications.requestPermissionsAsync();
      estado = pedido.status;
    }
    if (estado !== 'granted') return null;

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
