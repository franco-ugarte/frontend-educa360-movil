// Puente mínimo entre el cliente HTTP y la sesión: si el backend responde 401
// con un token adjunto, la sesión quedó inválida y la app vuelve al login.
let handler = null;

export function onUnauthorized(callback) {
  handler = callback;
  return () => {
    if (handler === callback) handler = null;
  };
}

export function notifyUnauthorized() {
  if (handler) handler();
}
