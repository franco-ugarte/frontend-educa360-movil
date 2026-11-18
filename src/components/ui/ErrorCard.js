import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

export function friendlyError(error) {
  if (!error) return 'Ocurrió un error inesperado.';
  if (error.status === 0) return 'Sin conexión al servidor. Revisa tu red y vuelve a intentar.';
  if (error.status === 400) return error.message || 'Los datos enviados no son válidos.';
  if (error.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (error.status === 403) return 'Tu cuenta no tiene acceso a esta información.';
  if (error.status === 404) return error.message || 'No encontramos la información solicitada.';
  if (error.status === 409) return error.message || 'La operación entra en conflicto con el estado actual.';
  if (error.status === 429) return `Demasiados intentos. Reintenta en ${error.retryAfter || '?'}s.`;
  if (error.status >= 500) return 'El servicio no está disponible en este momento.';
  return error.message || 'Ocurrió un error inesperado.';
}

export default function ErrorCard({ error, onRetry }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
        <Text style={styles.text}>{friendlyError(error)}</Text>
      </View>
      {onRetry ? (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.btnText}>Reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

ErrorCard.propTypes = { error: PropTypes.object, onRetry: PropTypes.func };

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginVertical: 8,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  text: { color: '#991B1B', fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 19 },
  btn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
});
