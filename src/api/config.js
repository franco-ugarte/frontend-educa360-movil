// Base URL del backend. En Expo Go físico usa tu IP LAN, ej:
// EXPO_PUBLIC_API_URL=http://192.168.1.50:8080 npx expo start
// Emulador Android: http://10.0.2.2:8080 | Web/iOS simulador: http://localhost:8080
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:8080';

export const API_PREFIX = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;
export const REQUEST_TIMEOUT_MS = 15000;
