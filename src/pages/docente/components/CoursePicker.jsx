import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { colors } from '../../../theme';
import { styles } from '../styles';

/** Selector horizontal de cursos del docente. */
export default function CoursePicker({ cursos = [], selectedId, onSelect }) {
  if (cursos.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      style={styles.filterScroll}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.coursePickerRow}
    >
      {cursos.map((curso) => {
        const activo = curso.id === selectedId;
        return (
          <TouchableOpacity
            key={curso.id}
            style={[styles.coursePickCard, activo && styles.coursePickCardActive]}
            activeOpacity={0.85}
            onPress={() => onSelect(curso.id)}
          >
            <View
              style={[
                styles.coursePickIcon,
                activo && styles.coursePickIconActive,
              ]}
            >
              <Ionicons
                name="book-outline"
                size={17}
                color={activo ? '#FFFFFF' : colors.primary}
              />
            </View>
            <View style={styles.coursePickInfo}>
              <Text
                style={[
                  styles.coursePickName,
                  activo && styles.coursePickNameActive,
                ]}
                numberOfLines={1}
              >
                {curso.materiaNombre}
              </Text>
              <Text
                style={[
                  styles.coursePickMeta,
                  activo && styles.coursePickMetaActive,
                ]}
                numberOfLines={1}
              >
                {curso.seccionEtiqueta} · {curso.anioNombre}
              </Text>
            </View>
            {activo ? (
              <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

CoursePicker.propTypes = {
  cursos: PropTypes.array,
  selectedId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};
