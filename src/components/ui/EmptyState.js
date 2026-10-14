import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

export default function EmptyState({ icon = 'hourglass-outline', title = 'Módulo pendiente', hint }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="#5F348F" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  hint: PropTypes.string,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, padding: 18, alignItems: 'center', gap: 6, marginVertical: 8,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#F3E8FF',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#1E1B4B', fontSize: 13.5, fontWeight: '800' },
  hint: { color: '#64748B', fontSize: 12, textAlign: 'center' },
});
