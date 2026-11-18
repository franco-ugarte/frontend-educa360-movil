import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { colors, radius, shadowSoft } from '../../theme';

const TONES = {
  purple: { bg: colors.primarySoft, icon: colors.primary },
  amber: { bg: colors.accentSoft, icon: '#B07A00' },
  green: { bg: colors.successSoft, icon: colors.successText },
  blue: { bg: colors.infoSoft, icon: colors.info },
};

/** Tarjeta de acceso rápido para la rejilla del inicio. */
export default function QuickAction({ icon, label, hint, tone = 'purple', onPress }) {
  const palette = TONES[tone] || TONES.purple;
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: palette.bg }]}>
        <Ionicons name={icon} size={21} color={palette.icon} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      {hint ? <Text style={styles.quickHint}>{hint}</Text> : null}
    </TouchableOpacity>
  );
}

QuickAction.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  tone: PropTypes.oneOf(['purple', 'amber', 'green', 'blue']),
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  quickCard: {
    width: '48.4%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    minHeight: 96,
    justifyContent: 'space-between',
    ...shadowSoft,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: { fontSize: 12.5, fontWeight: '800', color: colors.text, lineHeight: 17 },
  quickHint: { fontSize: 10.5, color: colors.muted, marginTop: 3, fontWeight: '500' },
});
