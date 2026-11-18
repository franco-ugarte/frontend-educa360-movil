import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { colors, radius } from '../../theme';

/**
 * Filtro horizontal de período: Año completo + los bimestres del año vigente.
 * `items` = [{ id, label }]; el id null representa el año completo.
 */
export default function BimestrePicker({ items, value, onChange }) {
  return (
    <ScrollView
      horizontal
      style={styles.chipsScroll}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <TouchableOpacity
            key={String(item.id)}
            activeOpacity={0.85}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(item.id)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

BimestrePicker.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), label: PropTypes.string })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chipsRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 4, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  chipTextActive: { color: '#FFFFFF' },
});
