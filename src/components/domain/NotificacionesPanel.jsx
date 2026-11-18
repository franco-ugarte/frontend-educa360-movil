import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useApi } from '../../hooks/useApi';
import {
  misNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  contadorNoLeidas,
} from '../../api/notificaciones';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import EmptyState from '../ui/EmptyState';
import { colors } from '../../theme';
import { fechaRelativa, hora, tipoNotificacion } from '../../utils/format';
import { styles } from './styles';

/**
 * Bandeja de notificaciones del usuario autenticado. El contador vive en el
 * proveedor de cada rol; este panel avisa con onCountChange cuando cambia.
 */
export default function NotificacionesPanel({ noLeidas = 0, onCountChange }) {
  const { data, loading, error, reload } = useApi(() => misNotificaciones(), []);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const marcarTodas = async () => {
    try {
      const result = await marcarTodasLeidas();
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
      onCountChange?.(result?.noLeidas ?? 0);
    } catch {
      // La bandeja conserva su estado si el backend no responde.
    }
  };

  const marcarUna = async (item) => {
    if (item.leida) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, leida: true } : n)));
    try {
      await marcarLeida(item.id);
    } catch {
      // Se corrige con el contador real del backend.
    }
    const count = await contadorNoLeidas().catch(() => null);
    if (count) onCountChange?.(count.noLeidas ?? 0);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.overlayScrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading && !!data}
          onRefresh={reload}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {noLeidas > 0 ? (
        <TouchableOpacity style={styles.markAllRow} activeOpacity={0.85} onPress={marcarTodas}>
          <Ionicons name="checkmark-done-outline" size={17} color={colors.primary} />
          <Text style={styles.markAllRowText}>Marcar todas como leídas</Text>
        </TouchableOpacity>
      ) : null}

      {loading && !data ? (
        <LoadingView message="Cargando notificaciones..." />
      ) : error ? (
        <ErrorCard error={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="Todo al día"
          hint="No tienes notificaciones pendientes. Te avisaremos de notas, asistencias y comunicados."
        />
      ) : (
        items.map((item) => {
          const meta = tipoNotificacion(item.tipo);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.notifCard, !item.leida && styles.notifCardUnread]}
              activeOpacity={0.85}
              onPress={() => marcarUna(item)}
            >
              <View style={styles.notifIcon}>
                <Ionicons name={meta.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTitleRow}>
                  <Text style={styles.notifTitle} numberOfLines={2}>{item.titulo}</Text>
                  {!item.leida ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.notifText}>{item.mensaje}</Text>
                <Text style={styles.notifDate}>
                  {meta.label} · {fechaRelativa(item.createdAt)}
                  {item.createdAt ? ` · ${hora(String(item.createdAt).slice(11, 16))}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.footNote}>
        Tus notificaciones quedan guardadas aunque cierres la app.
      </Text>
    </ScrollView>
  );
}

NotificacionesPanel.propTypes = {
  noLeidas: PropTypes.number,
  onCountChange: PropTypes.func,
};
