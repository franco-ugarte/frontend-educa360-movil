import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './CosmicButton.styles';

export default function CosmicButton({
  onPress,
  title = 'Continuar',
  gradientColors = ['#A855F7', '#F59E0B'], // Violeta eléctrico a Ámbar cálido
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.container}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.innerCore}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
CosmicButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};