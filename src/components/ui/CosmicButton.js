import React from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './CosmicButton.styles';

export default function CosmicButton({
  onPress,
  title = 'Continuar',
  gradientColors = ['#A855F7', '#F59E0B'], // Violeta eléctrico a Ámbar cálido
  loading = false,
  disabled = false,
}) {
  const inactive = loading || disabled;
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      style={[styles.container, inactive && { opacity: 0.6 }]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.innerCore}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.titleText}>{title}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
CosmicButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  gradientColors: PropTypes.array,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};