import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { styles } from './GradientButtonGroup.styles';

export default function GradientButtonGroup({ 
  tabs = [], 
  activeTab = 'inicio', 
  onSelectTab = () => {} 
}) {
  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.dockBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (isActive) {
            return (
              <LinearGradient
                key={tab.id}
                colors={['#8C4ABD', '#F9B201']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeBorder}
              >
                <TouchableOpacity
                  style={styles.activeInner}
                  activeOpacity={0.85}
                  onPress={() => onSelectTab(tab.id)}
                >
                  <Ionicons name={tab.icon} size={18} color="#5F348F" />
                  <Text style={styles.activeLabel}>{tab.label}</Text>
                </TouchableOpacity>
              </LinearGradient>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.inactiveTab}
              activeOpacity={0.7}
              onPress={() => onSelectTab(tab.id)}
            >
              <Ionicons name={tab.iconOutline || tab.icon} size={18} color="#94A3B8" />
              <Text style={styles.inactiveLabel}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

GradientButtonGroup.propTypes = {
  tabs: PropTypes.array.isRequired,
  activeTab: PropTypes.string.isRequired,
  onSelectTab: PropTypes.func.isRequired,
};