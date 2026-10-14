import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import FormModal from './FormModal';

// Selector sin dependencias nativas: botón + modal con opciones.
export default function PickerField({ label, value, options, onSelect, placeholder = 'Elegir…' }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.box} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={[styles.text, !current && styles.empty]}>
          {current ? current.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>
      <FormModal visible={open} title={label} onClose={() => setOpen(false)}>
        {options.map((o) => (
          <TouchableOpacity
            key={String(o.value)}
            style={[styles.opt, o.value === value && styles.optActive]}
            onPress={() => {
              onSelect(o.value);
              setOpen(false);
            }}
          >
            <Text style={[styles.optText, o.value === value && styles.optTextActive]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </FormModal>
    </View>
  );
}

PickerField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.any })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  box: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  text: { fontSize: 15, color: '#0F172A' },
  empty: { color: '#94A3B8' },
  opt: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  optActive: { backgroundColor: '#F3E8FF', borderRadius: 8, paddingHorizontal: 8 },
  optText: { fontSize: 15, color: '#0F172A' },
  optTextActive: { color: '#5F348F', fontWeight: '700' },
});
