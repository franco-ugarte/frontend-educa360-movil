import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

export default function LoadingView({ message = 'Cargando...' }) {
  return (
    <View style={styles.box}>
      <ActivityIndicator size="large" color="#5F348F" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

LoadingView.propTypes = { message: PropTypes.string };

const styles = StyleSheet.create({
  box: { padding: 24, alignItems: 'center', justifyContent: 'center', gap: 10 },
  text: { color: '#64748B', fontSize: 13, fontWeight: '600' },
});
