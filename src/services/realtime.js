// El polyfill se evalúa antes que @stomp/stompjs (los imports se ejecutan en orden).
import './stompPolyfill';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../api/config';
import { getToken } from '../api/token';
import { notificarLocal } from './push';

/**
 * Cliente STOMP real sobre WebSocket nativo (no SockJS, no polling, no mocks).
 *
 * El backend expone /ws (nativo) y /ws-sockjs (fallback). Spring publica cada
 * aviso en /user/queue/notificaciones, ya aislado por el usuario del JWT, así
 * que no hay canales distintos por rol: el filtro lo hace el servidor.
 */

const DESTINO = '/user/queue/notificaciones';
const oyentes = new Set();

let cliente = null;

/** Se suscribe a los avisos que llegan por STOMP para refrescar la bandeja. */
export function onNotificacionTiempoReal(callback) {
  oyentes.add(callback);
  return () => oyentes.delete(callback);
}

function urlWebSocket() {
  const url = new URL(API_BASE_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  url.hash = '';
  return url.toString();
}

function payload(body) {
  if (typeof body !== 'string') return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return { titulo: 'Educa360', mensaje: body };
  }
}

function procesarMensaje(mensaje) {
  const datos = payload(mensaje.body);
  const aviso = datos.notificacion || datos;
  if (!aviso || typeof aviso !== 'object') return;

  const title = aviso.titulo || 'Educa360';
  const body = aviso.mensaje || 'Tienes una novedad en Educa360.';

  notificarLocal({
    title,
    body,
    data: {
      origen: 'stomp',
      notificacionId: aviso.id ? String(aviso.id) : undefined,
      tipo: aviso.tipo || undefined,
      referenciaId: aviso.referenciaId ? String(aviso.referenciaId) : undefined,
    },
  }).catch(() => {});

  oyentes.forEach((callback) => callback(aviso));
}

/** Abre el túnel STOMP con el JWT de la sesión. Idempotente. */
export async function conectarRealtime({ rol } = {}) {
  const token = await getToken();
  if (!token) return null;
  if (cliente?.active) return cliente;

  desconectarRealtime();

  cliente = new Client({
    brokerURL: urlWebSocket(),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
    beforeConnect: async () => {
      const vigente = await getToken();
      if (cliente && vigente) {
        cliente.connectHeaders = { Authorization: `Bearer ${vigente}` };
      }
    },
    onConnect: () => {
      console.log('[STOMP] Conectado');
      if (rol) console.log('[STOMP] Rol', rol);
      cliente.subscribe(DESTINO, procesarMensaje);
    },
    onStompError: (frame) => {
      console.error('[STOMP] Error', frame);
    },
    onWebSocketError: (event) => {
      console.error('[STOMP] Error', event);
    },
  });

  cliente.activate();
  return cliente;
}

/** Cierra el túnel al salir o al perder la autorización. */
export function desconectarRealtime() {
  if (!cliente) return;
  const actual = cliente;
  cliente = null;
  actual.deactivate();
}
