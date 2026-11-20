import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

/** Límite del backend para sustentos. */
export const MAX_SUSTENTO_BYTES = 5 * 1024 * 1024;

/** Extensiones que acepta el backend para el sustento. */
const EXTENSIONES_SUSTENTO = ['jpg', 'jpeg', 'png', 'pdf'];

/**
 * Si el permiso se puede pedir de nuevo, el mensaje vuelve al formulario.
 * Si fue denegado permanentemente, se ofrece abrir Ajustes desde un Alert.
 */
function avisoPermiso(mensaje, canAskAgain) {
  if (canAskAgain) {
    throw new Error(mensaje);
  }
  Alert.alert(
    'Permiso desactivado',
    `${mensaje} Actívalo en Configuración para adjuntar el sustento.`,
    [
      { text: 'Ahora no', style: 'cancel' },
      { text: 'Abrir Configuración', onPress: () => Linking.openSettings() },
    ]
  );
}

/**
 * Abre cámara o galería y devuelve el asset (o null si se cancela).
 * Siempre pide el permiso antes de lanzar el selector nativo.
 */
export async function elegirImagen(origen) {
  if (origen === 'camera') {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      avisoPermiso('Necesitamos permiso para usar la cámara.', canAskAgain);
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    return result.canceled ? null : result.assets?.[0] || null;
  }

  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    avisoPermiso('Necesitamos permiso para acceder a tus fotos.', canAskAgain);
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
  });
  return result.canceled ? null : result.assets?.[0] || null;
}

/**
 * Abre el selector de documentos y devuelve un PDF (o null si se cancela).
 * `copyToCacheDirectory` deja el archivo legible por expo-file-system.
 */
export async function elegirPdf() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });
  return result.canceled ? null : result.assets?.[0] || null;
}

/**
 * Arma el FormData multipart que espera el backend (campo `archivo`).
 * Acepta imágenes (cámara/galería) y PDF (selector de documentos).
 *
 * En Android/iOS el `fetch` global de Expo SDK 58 es el de `expo/fetch`, que
 * NO entiende el FormData propietario de React Native (`{ uri, name, type }`):
 * lanza "Unsupported FormDataPart implementation" antes de enviar. Por eso el
 * archivo se adjunta como `File` de expo-file-system, que sí expone `.bytes()`.
 */
export async function formDataDeSustento(asset) {
  const form = new FormData();
  const nombreOriginal = asset?.fileName || asset?.name;
  const mime = String(asset?.mimeType || '').toLowerCase();
  const extensionMime = mime.split('/')[1] || 'jpg';
  const name =
    nombreOriginal ||
    `sustento-${Date.now()}.${extensionMime === 'jpeg' ? 'jpg' : extensionMime}`;

  if (Platform.OS === 'web') {
    if (asset?.file) {
      form.append('archivo', asset.file, name);
    } else {
      const blob = await fetch(asset.uri).then((r) => r.blob());
      form.append('archivo', blob, name);
    }
    return form;
  }

  const file = new File(asset.uri);
  const extension = (String(file.name).toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1];

  if (!extension) {
    throw new Error('No se pudo leer el archivo elegido. Intenta con otro archivo.');
  }
  if (!EXTENSIONES_SUSTENTO.includes(extension)) {
    throw new Error('Solo se aceptan archivos JPG, PNG o PDF.');
  }
  if (typeof file.size === 'number' && file.size > MAX_SUSTENTO_BYTES) {
    throw new Error('El archivo supera los 5 MB. Elige uno más liviano.');
  }

  form.append('archivo', file);
  return form;
}
