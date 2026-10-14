import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistencia exigida por el profesor (AsyncStorage): token + user + rol.
const K_TOKEN = '@educa360:token';
const K_USER = '@educa360:user';

export async function saveSession(token, user) {
  await AsyncStorage.multiSet([
    [K_TOKEN, token || ''],
    [K_USER, JSON.stringify(user || null)],
  ]);
}

export async function getToken() {
  return AsyncStorage.getItem(K_TOKEN);
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(K_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove([K_TOKEN, K_USER]);
}
