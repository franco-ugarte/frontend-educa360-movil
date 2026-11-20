/**
 * Hermes no expone TextEncoder/TextDecoder globales y @stomp/stompjs los usa
 * para codificar los frames. Este módulo debe importarse ANTES del cliente.
 */
import { TextDecoder, TextEncoder } from 'text-encoding';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}
