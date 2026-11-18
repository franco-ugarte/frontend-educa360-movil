import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useAuth } from '../../../state/AuthContext';
import { useApoderadoData } from '../data';
import ChildPicker from '../components/ChildPicker';
import SectionTitle from '../../../components/ui/SectionTitle';
import QuickAction from '../../../components/ui/QuickAction';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import LoadingView from '../../../components/ui/LoadingView';
import { estadoTone } from '../components/TicketCard';
import { displayName } from '../../../api/mappers';
import {
  fechaCorta,
  fechaRelativa,
  hora,
  iniciales,
  nota,
  parentescoLabel,
  porcentaje,
  semaforoNota,
  situacionLabel,
} from '../../../utils/format';
import { styles } from '../styles';

export default function InicioView({ onNavigate, onOpenComunicados, onOpenHorario }) {
  const { user } = useAuth();
  const {
    hijos,
    hijo,
    selectChild,
    calificaciones,
    asistencias,
    tickets,
    horario,
    comunicados,
    loading,
    refreshing,
    error,
    childError,
    childLoaded,
    refresh,
  } = useApoderadoData();

  const initialLoading =
    (!childLoaded && hijos.length > 0) || (loading && !hijos.length);
  if (initialLoading) {
    return <LoadingView message="Cargando la información de tus hijos..." />;
  }

  const tonePromedio = semaforoNota(calificaciones?.promedioGeneral);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => refresh({ silent: true })}
          colors={['#5F348F']}
          tintColor="#5F348F"
        />
      }
    >
      <ChildPicker
        hijos={hijos}
        selectedId={hijo?.estudianteId}
        onSelect={selectChild}
      />

      {!hijos.length ? (
        <View style={styles.overlayEmptyWrap}>
          <EmptyState
            icon="people-outline"
            title="Sin hijos vinculados"
            hint="El colegio vincula a tus hijos con tu cuenta. Si falta alguno, contacta a Secretaría."
          />
          {error ? (
            <View style={{ marginTop: 16 }}>
              <ErrorCard error={error} onRetry={() => refresh()} />
            </View>
          ) : null}
        </View>
      ) : (
        <>
          <View style={styles.childCard}>
            <View style={styles.childTop}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>
                  {iniciales(hijo?.nombres, hijo?.apellidos)}
                </Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName} numberOfLines={2}>
                  {hijo?.nombres} {hijo?.apellidos}
                </Text>
                <View style={styles.childParentescoRow}>
                  <Text style={styles.childParentesco}>
                    {parentescoLabel(hijo?.parentesco)}
                  </Text>
                  {hijo?.responsablePrincipal ? (
                    <View style={styles.childPrincipal}>
                      <Ionicons name="star" size={9} color="#8A5B00" />
                      <Text style={styles.childPrincipalText}>Responsable</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.childSectionRow}>
              <Ionicons name="school-outline" size={15} color="#5F348F" />
              <Text style={styles.childSection} numberOfLines={1}>
                {hijo?.seccionEtiqueta
                  ? `${hijo.seccionEtiqueta} · ${hijo.anioNombre}`
                  : 'Sin matrícula vigente'}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {hijo?.situacionFinal
                  ? situacionLabel(hijo.situacionFinal)
                  : 'Sin matrícula'}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <View style={styles.statValueRow}>
                  {tonePromedio ? (
                    <View
                      style={[styles.statDot, { backgroundColor: tonePromedio.dot }]}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.statValue,
                      tonePromedio && { color: tonePromedio.text },
                    ]}
                  >
                    {nota(calificaciones?.promedioGeneral)}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Promedio</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statValue}>
                  {porcentaje(asistencias?.porcentaje)}
                </Text>
                <Text style={styles.statLabel}>Asistencia</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={[styles.statValue, styles.statValueAccent]}>
                  {asistencias ? asistencias.faltas ?? 0 : '—'}
                </Text>
                <Text style={styles.statLabel}>Faltas</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.scheduleCard}
            activeOpacity={0.85}
            onPress={onOpenHorario}
          >
            <View style={styles.scheduleCardIcon}>
              <Ionicons name="calendar-outline" size={20} color="#5F348F" />
            </View>
            <View style={styles.scheduleCardInfo}>
              <Text style={styles.scheduleCardTitle}>Horario de clases</Text>
              <Text style={styles.scheduleCardMeta} numberOfLines={1}>
                {horario.length
                  ? `${horario.length} ${
                      horario.length === 1 ? 'bloque' : 'bloques'
                    } esta semana`
                  : 'Aún sin bloques registrados'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {childError ? (
            <View style={styles.section}>
              <ErrorCard error={childError} onRetry={() => refresh({ silent: true })} />
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="Accesos rápidos" />
            <View style={styles.quickGrid}>
              <QuickAction
                icon="stats-chart-outline"
                label="Notas"
                hint="Promedios del año"
                tone="green"
                onPress={() => onNavigate('notas')}
              />
              <QuickAction
                icon="checkmark-done-outline"
                label="Asistencia"
                hint="Faltas y registro"
                tone="blue"
                onPress={() => onNavigate('asistencia')}
              />
              <QuickAction
                icon="document-text-outline"
                label="Justificar"
                hint="Registrar inasistencia"
                tone="amber"
                onPress={() => onNavigate('justificar')}
              />
              <QuickAction
                icon="megaphone-outline"
                label="Comunicados"
                hint="Avisos del colegio"
                tone="purple"
                onPress={onOpenComunicados}
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle
              title="Justificaciones recientes"
              actionLabel={tickets.length ? 'Ver historial' : undefined}
              onAction={() => onNavigate('justificar')}
            />
            {tickets.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                title="Sin justificaciones"
                hint="Si tu hijo falta a clases, puedes registrar la justificación desde la pestaña Justificar."
              />
            ) : (
              tickets.slice(0, 2).map((ticket) => {
                const tone = estadoTone(ticket.estado);
                return (
                  <TouchableOpacity
                    key={ticket.id}
                    style={styles.noticeCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigate('justificar')}
                  >
                    <View style={styles.recentTicketHead}>
                      <View style={[styles.statePill, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.stateText, { color: tone.text }]}>
                          {tone.label}
                        </Text>
                      </View>
                      <Text style={styles.recentTicketDate}>
                        {fechaCorta(ticket.fechaInasistencia)}
                      </Text>
                    </View>
                    <Text style={styles.noticeBody} numberOfLines={2}>
                      {ticket.motivo}
                    </Text>
                    <Text style={styles.ticketScope} numberOfLines={1}>
                      {ticket.bloqueId
                        ? `${ticket.materiaNombre || 'Bloque'} · ${hora(
                            ticket.horaInicio
                          )} – ${hora(ticket.horaFin)}`
                        : 'Día completo'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={styles.section}>
            <SectionTitle
              title="Avisos recientes"
              actionLabel={comunicados.length ? 'Ver todos' : undefined}
              onAction={onOpenComunicados}
            />
            {comunicados.length === 0 ? (
              <EmptyState
                icon="megaphone-outline"
                title="Sin comunicados por ahora"
                hint="Los avisos del colegio y de los docentes aparecerán aquí."
              />
            ) : (
              comunicados.slice(0, 2).map((item) => (
                <View key={item.id} style={styles.noticeCard}>
                  <View style={styles.noticeHead}>
                    <View style={styles.noticeAvatar}>
                      <Ionicons name="megaphone" size={15} color="#5F348F" />
                    </View>
                    <View style={styles.noticeAuthorBox}>
                      <Text style={styles.noticeAuthor} numberOfLines={1}>
                        {item.autorNombre}
                      </Text>
                      <Text style={styles.noticeDate}>
                        {fechaRelativa(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.noticeBody} numberOfLines={3}>
                    {item.contenido}
                  </Text>
                  <View style={styles.noticeChip}>
                    <Text style={styles.noticeChipText}>
                      {item.seccionEtiqueta
                        ? `Sección ${item.seccionEtiqueta}`
                        : 'General'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <Text style={styles.footNote}>
            Sesión de {displayName(user)} · Educa360
          </Text>
        </>
      )}
    </ScrollView>
  );
}

InicioView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onOpenComunicados: PropTypes.func.isRequired,
  onOpenHorario: PropTypes.func.isRequired,
};
