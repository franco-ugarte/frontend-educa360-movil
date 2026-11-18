import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { useAuth } from '../../state/AuthContext';
import { colors, radius, shadow } from '../../theme';

const MAX_TELEFONOS = 5;
// El backend acepta `\+?\d{7,15}`: sólo dígitos, opcionalmente con +.
const FORMATO = /^\+?\d{7,15}$/;

/**
 * Limpia espacios, paréntesis y guiones para enviar el formato del backend.
 * El usuario puede escribir "999 888 777" o "(01) 456-7890".
 */
function normalizarTelefono(valor) {
  return String(valor || '')
    .replace(/[\s()\-.]/g, '')
    .trim();
}

/**
 * Edición de los teléfonos del propio usuario.
 *
 * Usa `PATCH /auth/me/telefonos`: la lista enviada reemplaza la anterior, `[]`
 * los quita todos y el máximo son 5. El backend acepta `\+?\d{7,15}`, así que
 * se limpian espacios, paréntesis y guiones antes de enviar. El rol ESTUDIANTE
 * recibe 403: sus contactos los gestiona su apoderado.
 */
export default function PhoneEditor({ visible, telefonos, onClose, onSaved }) {
  const { updateTelefonos } = useAuth();
  const insets = useSafeAreaInsets();
  const [lista, setLista] = useState(['']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible) return;
    const base =
      Array.isArray(telefonos) && telefonos.length ? telefonos : [''];
    setLista(base.slice(0, MAX_TELEFONOS).map((valor) => String(valor)));
    setError(null);
    setSaving(false);
  }, [visible, telefonos]);

  const cambiar = (index, texto) => {
    setLista((prev) => prev.map((item, i) => (i === index ? texto : item)));
    if (error) setError(null);
  };

  const agregar = () => {
    setLista((prev) =>
      prev.length >= MAX_TELEFONOS ? prev : [...prev, '']
    );
  };

  const quitar = (index) => {
    setLista((prev) => {
      const siguiente = prev.filter((_, i) => i !== index);
      return siguiente.length ? siguiente : [''];
    });
    if (error) setError(null);
  };

  const guardar = async () => {
    if (saving) return;
    const limpios = [];
    for (const item of lista) {
      const crudo = String(item || '').trim();
      if (!crudo) continue;
      const valor = normalizarTelefono(crudo);
      if (!FORMATO.test(valor)) {
        setError(
          'Teléfono inválido: escribe entre 7 y 15 dígitos (puedes usar + para el código de país).'
        );
        return;
      }
      if (!limpios.includes(valor)) limpios.push(valor);
    }

    if (limpios.length > MAX_TELEFONOS) {
      setError(`Máximo ${MAX_TELEFONOS} teléfonos.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateTelefonos(limpios);
      onSaved?.(limpios);
      onClose?.();
    } catch (e) {
      if (e?.status === 403) {
        setError('Tu apoderado es quien gestiona tus teléfonos de contacto.');
      } else if (e?.status === 404 || e?.status === 405 || e?.status === 501) {
        setError(
          'La edición de teléfonos aún no está disponible en la app. Puedes cambiarlos desde la web.'
        );
      } else {
        setError(e?.message || 'No se pudieron guardar los teléfonos.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.handle} />

            <View style={styles.head}>
              <View style={styles.headIcon}>
                <Ionicons name="call-outline" size={19} color={colors.primary} />
              </View>
              <View style={styles.headText}>
                <Text style={styles.title}>Teléfonos de contacto</Text>
                <Text style={styles.subtitle}>
                  El colegio los usa para avisos urgentes.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.close}
                activeOpacity={0.8}
                onPress={onClose}
                accessibilityLabel="Cerrar"
              >
                <Ionicons name="close" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {lista.map((valor, index) => (
              <View key={`telefono-${index}`} style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={valor}
                  onChangeText={(texto) => cambiar(index, texto)}
                  placeholder="Ej.: 999 888 777"
                  placeholderTextColor={colors.faint}
                  keyboardType="phone-pad"
                  maxLength={20}
                  editable={!saving}
                />
                <TouchableOpacity
                  style={styles.remove}
                  activeOpacity={0.8}
                  onPress={() => quitar(index)}
                  disabled={saving}
                  accessibilityLabel={`Quitar teléfono ${index + 1}`}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.dangerText} />
                </TouchableOpacity>
              </View>
            ))}

            {lista.length < MAX_TELEFONOS ? (
              <TouchableOpacity
                style={styles.add}
                activeOpacity={0.8}
                onPress={agregar}
                disabled={saving}
              >
                <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.addText}>Agregar otro teléfono</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.limitHint}>
                Máximo {MAX_TELEFONOS} teléfonos.
              </Text>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancel}
                activeOpacity={0.85}
                onPress={onClose}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.save, saving && styles.saveDisabled]}
                activeOpacity={0.85}
                onPress={guardar}
                disabled={saving}
              >
                <Ionicons
                  name={saving ? 'hourglass-outline' : 'checkmark'}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.saveText}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footNote}>
              Si dejas la lista vacía, se quitarán todos tus teléfonos.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

PhoneEditor.propTypes = {
  visible: PropTypes.bool.isRequired,
  telefonos: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboard: { width: '100%' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...shadow,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: colors.text,
    fontWeight: '600',
  },
  remove: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 4,
  },
  addText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  limitHint: {
    fontSize: 10.5,
    color: colors.faint,
    fontWeight: '600',
    marginBottom: 4,
  },
  error: {
    fontSize: 11.5,
    color: colors.dangerText,
    fontWeight: '600',
    marginTop: 6,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancel: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSoft },
  save: {
    flex: 1.4,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  saveDisabled: { opacity: 0.6 },
  saveText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  footNote: {
    fontSize: 10,
    color: colors.faint,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
});
