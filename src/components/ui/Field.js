import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

// Campo de texto con el estilo del proyecto (etiqueta gris + input claro).
export default function Field({ label, ...props }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

Field.propTypes = { label: PropTypes.string.isRequired };

const styles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#0F172A',
  },
});
