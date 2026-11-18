import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/** Límite del backend para sustentos. */
export const MAX_SUSTENTO_BYTES = 5 * 1024 * 1024;

/**
 * Abre cámara o galería y devuelve el asset (o null si se cancela).
 * Lanza un Error con mensaje legible si falta permiso.
 */
export async function elegirImagen(origen) {
  if (origen === 'camera') {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      throw new Error('Necesitamos permiso para usar la cámara.');
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    return result.canceled ? null : result.assets?.[0] || null;
  }

  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) {
    throw new Error('Necesitamos permiso para acceder a tus fotos.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
  });
  return result.canceled ? null : result.assets?.[0] || null;
}

/** Arma el FormData multipart que espera el backend (campo `archivo`). */
export async function formDataDeSustento(asset) {
  const form = new FormData();
  const extension = String(asset?.mimeType || 'image/jpeg').split('/')[1] || 'jpg';
  const name =
    asset?.fileName || `sustento-${Date.now()}.${extension === 'jpeg' ? 'jpg' : extension}`;

  if (Platform.OS === 'web') {
    if (asset?.file) {
      form.append('archivo', asset.file, name);
    } else {
      const blob = await fetch(asset.uri).then((r) => r.blob());
      form.append('archivo', blob, name);
    }
  } else {
    form.append('archivo', {
      uri: asset.uri,
      name,
      type: asset.mimeType || 'image/jpeg',
    });
  }
  return form;
}
