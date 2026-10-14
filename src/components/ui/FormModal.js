import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

// Modal con la estética del proyecto (card blanca, esquinas 20, morado).
export default function FormModal({ visible, title, onClose, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

FormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '88%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#1E1B4B' },
});
