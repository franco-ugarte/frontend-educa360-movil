import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

export function friendlyError(error) {
  if (!error) return 'Ocurrió un error inesperado.';
  if (error.status === 0) return 'Sin conexión al backend. Verifica tu red y la URL del API.';
  if (error.status === 401) return 'Correo o contraseña incorrectos.';
  if (error.status === 403) return 'Sin permiso: tu rol no accede a este módulo.';
  if (error.status === 409) return error.message || 'Dato duplicado (email/DNI ya registrado).';
  if (error.status === 429)
    return `Demasiados intentos. Reintenta en ${error.retryAfter || '?'}s.`;
  return error.message || 'Ocurrió un error inesperado.';
}

export default function ErrorCard({ error, onRetry }) {
  return (
    <View style={styles.card}>
      <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
      <Text style={styles.text}>{friendlyError(error)}</Text>
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
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 14, padding: 14, gap: 8, marginVertical: 8,
  },
  text: { color: '#991B1B', fontSize: 13, fontWeight: '600' },
  btn: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingVertical: 8, alignItems: 'center',
  },
  btnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
});
