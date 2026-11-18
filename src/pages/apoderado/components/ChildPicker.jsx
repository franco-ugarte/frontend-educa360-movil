import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { colors } from '../../../theme';
import { iniciales } from '../../../utils/format';
import { styles } from '../styles';

/**
 * Selector horizontal del hijo activo. Sólo aparece con más de un hijo:
 * con uno solo, el nombre ya está en la cabecera y en la tarjeta de inicio.
 */
export default function ChildPicker({ hijos = [], selectedId, onSelect }) {
  if (hijos.length < 2) return null;

  return (
    <ScrollView
      horizontal
      style={styles.filterScroll}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.childPickerRow}
    >
      {hijos.map((hijo) => {
        const active = hijo.estudianteId === selectedId;
        return (
          <TouchableOpacity
            key={hijo.estudianteId}
            activeOpacity={0.85}
            style={[styles.childPickCard, active && styles.childPickCardActive]}
            onPress={() => onSelect(hijo.estudianteId)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.childPickAvatar, active && styles.childPickAvatarActive]}>
              <Text
                style={[
                  styles.childPickAvatarText,
                  active && styles.childPickAvatarTextActive,
                ]}
              >
                {iniciales(hijo.nombres, hijo.apellidos)}
              </Text>
            </View>
            <View style={styles.childPickInfo}>
              <Text
                style={[styles.childPickName, active && styles.childPickNameActive]}
                numberOfLines={1}
              >
                {hijo.nombres}
              </Text>
              <Text
                style={[styles.childPickMeta, active && styles.childPickMetaActive]}
                numberOfLines={1}
              >
                {hijo.seccionEtiqueta
                  ? `${hijo.seccionEtiqueta} · ${hijo.anioNombre}`
                  : 'Sin matrícula'}
              </Text>
            </View>
            {active ? (
              <Ionicons name="checkmark-circle" size={19} color={colors.primary} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

ChildPicker.propTypes = {
  hijos: PropTypes.array,
  selectedId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};
