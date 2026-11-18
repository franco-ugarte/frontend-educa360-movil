import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { SEMAFORO_LEYENDA, semaforoNota } from '../../utils/format';
import { radius } from '../../theme';

/**
 * Semáforo de notas: 🟢 ≥ 16 · 🟡 11 – 15.99 · 🔴 < 11.
 *
 * Solo presentación: el promedio lo calcula el backend y aquí se colorea.
 * Se usa en las tarjetas de Notas y en el resumen de Inicio del estudiante
 * y del apoderado.
 */
export default function SemaforoBadge({ value, short = false }) {
  const tone = semaforoNota(value);
  if (!tone) return null;

  return (
    <View
      style={[styles.badge, { backgroundColor: tone.bg }]}
      accessibilityLabel={`Semáforo ${tone.label}`}
    >
      <View style={[styles.dot, { backgroundColor: tone.dot }]} />
      <Text style={[styles.label, { color: tone.text }]}>
        {short ? tone.emoji : tone.label}
      </Text>
    </View>
  );
}

/** Punto de color para acompañar una nota suelta. */
export function SemaforoDot({ value, size = 9 }) {
  const tone = semaforoNota(value);
  if (!tone) return null;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tone.dot,
      }}
      accessibilityLabel={`Semáforo ${tone.label}`}
    />
  );
}

/** Leyenda "🟢 ≥ 16 · 🟡 11 – 15.99 · 🔴 < 11". */
export function SemaforoLegend() {
  return (
    <View style={styles.legend}>
      {SEMAFORO_LEYENDA.map((tone) => (
        <View key={tone.key} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: tone.dot }]} />
          <Text style={[styles.legendText, { color: tone.text }]}>{tone.rango}</Text>
        </View>
      ))}
    </View>
  );
}

SemaforoBadge.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  short: PropTypes.bool,
};

SemaforoDot.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.number,
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 10, fontWeight: '800' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 10, fontWeight: '700' },
});
