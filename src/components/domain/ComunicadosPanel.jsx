import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import EmptyState from '../ui/EmptyState';
import { colors } from '../../theme';
import { fechaRelativa, iniciales } from '../../utils/format';
import { styles } from './styles';

/**
 * Bandeja de comunicados del rol autenticado. Se usa dentro de un Overlay,
 * tanto en estudiante como en apoderado.
 */
export default function ComunicadosPanel({ comunicados = [], onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.overlayScrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {comunicados.length === 0 ? (
        <EmptyState
          icon="megaphone-outline"
          title="Sin comunicados por ahora"
          hint="Los mensajes del colegio y de tus docentes llegarán aquí."
        />
      ) : (
        comunicados.map((item) => (
          <View key={item.id} style={styles.comCard}>
            <View style={styles.comHead}>
              <View style={styles.comAvatar}>
                <Text style={styles.comAvatarText}>{iniciales(item.autorNombre)}</Text>
              </View>
              <View style={styles.comAuthorBox}>
                <Text style={styles.comAuthor} numberOfLines={1}>{item.autorNombre}</Text>
                <Text style={styles.comDate}>{fechaRelativa(item.createdAt)}</Text>
              </View>
              <View style={styles.comChip}>
                <Text style={styles.comChipText}>
                  {item.seccionEtiqueta ? item.seccionEtiqueta : 'General'}
                </Text>
              </View>
            </View>
            <Text style={styles.comBody}>{item.contenido}</Text>
            <View style={styles.comScopeRow}>
              <Ionicons
                name={item.seccionEtiqueta ? 'people-outline' : 'globe-outline'}
                size={13}
                color={colors.faint}
              />
              <Text style={styles.comChipText}>
                {item.seccionEtiqueta
                  ? `Sección ${item.seccionEtiqueta}`
                  : 'Para todo el colegio'}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

ComunicadosPanel.propTypes = {
  comunicados: PropTypes.array,
  onRefresh: PropTypes.func,
};
