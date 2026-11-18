import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { colors } from '../../theme';

/**
 * Pantalla superpuesta a tamaño completo: se usa para comunicados,
 * notificaciones y detalles sin ensuciar la navegación inferior.
 */
export default function Overlay({ visible, onClose, title, subtitle, right, children }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryMuted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleBox}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          <View style={styles.rightSlot}>{right}</View>
        </LinearGradient>
        <View style={[styles.body, { paddingBottom: insets.bottom }]}>{children}</View>
      </View>
    </Modal>
  );
}

Overlay.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  right: PropTypes.node,
  children: PropTypes.node,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: { flex: 1, paddingHorizontal: 10 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  subtitle: { color: '#E9D5FF', fontSize: 11.5, marginTop: 2, fontWeight: '600' },
  rightSlot: { minWidth: 40, alignItems: 'flex-end' },
  body: { flex: 1 },
});
