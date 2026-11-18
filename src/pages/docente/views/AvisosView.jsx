import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useAuth } from '../../../state/AuthContext';
import { useDocenteData } from '../data';
import { eliminarComunicado } from '../../../api/docente';
import ComunicadoForm from '../components/ComunicadoForm';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard, { friendlyError } from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { colors } from '../../../theme';
import { fechaRelativa, iniciales } from '../../../utils/format';
import { styles } from '../styles';

export default function AvisosView({ openCompose, onConsumeCompose }) {
  const { user } = useAuth();
  const {
    cursos,
    comunicados,
    loading,
    error,
    refresh,
    refreshComunicados,
    upsertComunicado,
    removeComunicado,
  } = useDocenteData();

  const [filter, setFilter] = useState('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const scrollRef = useRef(null);

  const mios = useMemo(
    () => comunicados.filter((item) => item.autorId === user?.id),
    [comunicados, user?.id]
  );

  const lista = filter === 'mios' ? mios : comunicados;

  const irArriba = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const abrirNuevo = () => {
    setEditing(null);
    setFormOpen(true);
    setSuccess(null);
    setActionError(null);
    irArriba();
  };

  const abrirEditar = (item) => {
    setEditing(item);
    setFormOpen(true);
    setSuccess(null);
    setActionError(null);
    irArriba();
  };

  const cerrarFormulario = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const alGuardar = (item, { edit } = {}) => {
    upsertComunicado(item);
    setFormOpen(false);
    setEditing(null);
    setSuccess(edit ? 'Aviso actualizado.' : 'Aviso publicado.');
    setActionError(null);
    irArriba();
  };

  const confirmarEliminar = (item) => {
    Alert.alert(
      'Eliminar aviso',
      'El aviso dejará de mostrarse a las familias. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            setActionError(null);
            setSuccess(null);
            try {
              await eliminarComunicado(item.id);
              removeComunicado(item.id);
              if (editing?.id === item.id) cerrarFormulario();
              setSuccess('Aviso eliminado.');
            } catch (e) {
              setActionError(friendlyError(e));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const recargar = async () => {
    setRefreshing(true);
    try {
      await refreshComunicados();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!openCompose) return;
    setEditing(null);
    setFormOpen(true);
    setSuccess(null);
    setActionError(null);
    onConsumeCompose?.();
  }, [openCompose, onConsumeCompose]);

  if (loading && !comunicados.length) {
    return <LoadingView message="Cargando avisos..." />;
  }

  if (error && !comunicados.length) {
    return (
      <View style={styles.section}>
        <ErrorCard error={error} onRetry={() => refresh()} />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={recargar}
          colors={['#5F348F']}
          tintColor="#5F348F"
        />
      }
    >
      <View style={styles.avisosHeader}>
        <View style={styles.avisosHeaderIcon}>
          <Ionicons name="megaphone-outline" size={21} color="#5F348F" />
        </View>
        <View style={styles.avisosHeaderInfo}>
          <Text style={styles.avisosHeaderTitle}>Avisos express</Text>
          <Text style={styles.avisosHeaderMeta} numberOfLines={1}>
            {mios.length} {mios.length === 1 ? 'publicado por ti' : 'publicados por ti'} ·{' '}
            {comunicados.length} en total
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avisosNewBtn}
          activeOpacity={0.85}
          onPress={abrirNuevo}
        >
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.avisosNewText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {formOpen ? (
        <ComunicadoForm
          key={editing?.id || 'nuevo'}
          cursos={cursos}
          initial={editing}
          onCancel={cerrarFormulario}
          onSaved={alGuardar}
        />
      ) : null}

      {success ? (
        <View style={styles.avisosSuccess}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={colors.successText}
          />
          <Text style={styles.avisosSuccessText}>{success}</Text>
        </View>
      ) : null}

      {actionError ? (
        <View style={styles.avisosError}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={colors.dangerText}
          />
          <Text style={styles.avisosErrorText}>{actionError}</Text>
        </View>
      ) : null}

      <ScrollView
        horizontal
        style={styles.filterScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.filterChip, filter === 'todos' && styles.filterChipActive]}
          activeOpacity={0.85}
          onPress={() => setFilter('todos')}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'todos' && styles.filterChipTextActive,
            ]}
          >
            Todos
          </Text>
          <Text
            style={[
              styles.filterCount,
              filter === 'todos' && styles.filterCountActive,
            ]}
          >
            {comunicados.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'mios' && styles.filterChipActive]}
          activeOpacity={0.85}
          onPress={() => setFilter('mios')}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === 'mios' && styles.filterChipTextActive,
            ]}
          >
            Mis avisos
          </Text>
          <Text
            style={[
              styles.filterCount,
              filter === 'mios' && styles.filterCountActive,
            ]}
          >
            {mios.length}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.avisosList}>
        {lista.length === 0 ? (
          <EmptyState
            icon="megaphone-outline"
            title={
              filter === 'mios' ? 'Aún no publicaste avisos' : 'Sin comunicados'
            }
            hint={
              filter === 'mios'
                ? 'Publica un aviso express para las familias de tus secciones.'
                : 'Los comunicados del colegio y de tus secciones aparecerán aquí.'
            }
            actionLabel={filter === 'mios' ? 'Crear aviso' : undefined}
            onAction={filter === 'mios' ? abrirNuevo : undefined}
          />
        ) : (
          lista.map((item) => {
            const propio = item.autorId === user?.id;
            const eliminando = deletingId === item.id;
            return (
              <View key={item.id} style={styles.avisoCard}>
                <View style={styles.avisoHead}>
                  <View style={styles.avisoAvatar}>
                    <Text style={styles.avisoAvatarText}>
                      {iniciales(item.autorNombre)}
                    </Text>
                  </View>
                  <View style={styles.avisoAuthorBox}>
                    <Text style={styles.avisoAuthor} numberOfLines={1}>
                      {item.autorNombre}
                    </Text>
                    <Text style={styles.avisoDate}>
                      {fechaRelativa(item.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.avisoChip}>
                    <Text style={styles.avisoChipText}>
                      {item.seccionEtiqueta || 'General'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.avisoBody}>{item.contenido}</Text>

                <View style={styles.avisoFooter}>
                  <View style={styles.avisoScopeRow}>
                    <Ionicons
                      name={item.seccionEtiqueta ? 'people-outline' : 'globe-outline'}
                      size={13}
                      color={colors.faint}
                    />
                    <Text style={styles.avisoScopeText} numberOfLines={1}>
                      {item.seccionEtiqueta
                        ? `Sección ${item.seccionEtiqueta}`
                        : 'Para todo el colegio'}
                    </Text>
                  </View>

                  {propio ? (
                    <View style={styles.avisoActions}>
                      <TouchableOpacity
                        style={styles.avisoMiniBtn}
                        activeOpacity={0.8}
                        disabled={eliminando}
                        onPress={() => abrirEditar(item)}
                      >
                        <Ionicons
                          name="create-outline"
                          size={12}
                          color={colors.primary}
                        />
                        <Text style={styles.avisoMiniText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.avisoMiniBtn, styles.avisoDeleteBtn]}
                        activeOpacity={0.8}
                        disabled={eliminando}
                        onPress={() => confirmarEliminar(item)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={12}
                          color={colors.dangerText}
                        />
                        <Text
                          style={[styles.avisoMiniText, styles.avisoDeleteText]}
                        >
                          {eliminando ? 'Eliminando…' : 'Eliminar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.avisoReadonly}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={11}
                        color={colors.faint}
                      />
                      <Text style={styles.avisoReadonlyText}>Solo lectura</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      <Text style={styles.footNote}>
        Los avisos generales los publica el colegio. Solo puedes editar los tuyos.
      </Text>
    </ScrollView>
  );
}

AvisosView.propTypes = {
  openCompose: PropTypes.bool,
  onConsumeCompose: PropTypes.func,
};
