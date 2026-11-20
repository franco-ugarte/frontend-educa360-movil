import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useApoderadoData } from '../data';
import { useApi } from '../../../hooks/useApi';
import { asistenciasHijo } from '../../../api/apoderado';
import ChildPicker from '../components/ChildPicker';
import BimestrePicker from '../../../components/ui/BimestrePicker';
import SectionTitle from '../../../components/ui/SectionTitle';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import AsistenciaHistorial from '../../../components/domain/AsistenciaHistorial';
import { estadoTone } from '../components/TicketCard';
import { styles } from '../styles';
import { colors } from '../../../theme';
import { fechaCorta, porcentaje } from '../../../utils/format';

export default function AsistenciaView({ onJustificar, onGoJustificaciones, onOpenHorario }) {
  const { hijos, hijo, selectChild, childBimestres, tickets } = useApoderadoData();
  const [bimestreId, setBimestreId] = useState(null);

  useEffect(() => {
    setBimestreId(null);
  }, [hijo?.estudianteId]);

  const { data, loading, error, reload } = useApi(
    () =>
      hijo
        ? asistenciasHijo(hijo.estudianteId, { bimestreId })
        : Promise.resolve(null),
    [hijo?.estudianteId, bimestreId]
  );

  const periodos = useMemo(
    () => [
      { id: null, label: 'Año completo' },
      ...childBimestres.map((b) => ({ id: b.id, label: `Bim. ${b.numero}` })),
    ],
    [childBimestres]
  );

  const detalle = useMemo(() => {
    const list = [...(data?.detalle || [])];
    return list.sort((a, b) => {
      const byDate = String(b.fecha).localeCompare(String(a.fecha));
      if (byDate !== 0) return byDate;
      return String(b.horaInicio || '').localeCompare(String(a.horaInicio || ''));
    });
  }, [data]);

  const ticketDe = (item) => {
    if (item.ticketId) {
      const directo = tickets.find((t) => t.id === item.ticketId);
      if (directo) return directo;
    }
    return (
      tickets.find(
        (t) =>
          t.estado !== 'RECHAZADO' &&
          t.fechaInasistencia === item.fecha &&
          (t.bloqueId == null || t.bloqueId === item.bloqueId)
      ) || null
    );
  };

  const renderAcciones = (item) => {
    if (item.estado !== 'FALTA') return null;
    const ticket = ticketDe(item);
    const ticketTone = ticket ? estadoTone(ticket.estado) : null;

    if (ticket) {
      return (
        <>
          <Text style={styles.attTicketText} numberOfLines={1}>
            Ticket {ticketTone.label.toLowerCase()} ·{' '}
            {fechaCorta(ticket.fechaInasistencia)}
          </Text>
          <TouchableOpacity
            style={styles.attJustifyBtn}
            activeOpacity={0.85}
            onPress={onGoJustificaciones}
          >
            <Ionicons
              name="document-text-outline"
              size={13}
              color="#FFFFFF"
            />
            <Text style={styles.attJustifyText}>Ver ticket</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <Text style={styles.attTicketText} numberOfLines={1}>
          Falta sin justificar
        </Text>
        <TouchableOpacity
          style={styles.attJustifyBtn}
          activeOpacity={0.85}
          onPress={() =>
            onJustificar({
              fecha: item.fecha,
              bloqueId: item.bloqueId,
            })
          }
        >
          <Ionicons name="create-outline" size={13} color="#FFFFFF" />
          <Text style={styles.attJustifyText}>Justificar</Text>
        </TouchableOpacity>
      </>
    );
  };

  const pct = Number(data?.porcentaje ?? 0);
  const fill = `${Math.max(0, Math.min(100, pct))}%`;
  const sinMatricula = error?.status === 404;

  return (
    <View style={styles.viewBody}>
      <ChildPicker hijos={hijos} selectedId={hijo?.estudianteId} onSelect={selectChild} />

      <View style={{ paddingTop: 14, paddingBottom: 4 }}>
        <BimestrePicker items={periodos} value={bimestreId} onChange={setBimestreId} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && !!data}
            onRefresh={reload}
            colors={['#5F348F']}
            tintColor="#5F348F"
          />
        }
      >
        {!hijo ? (
          <View style={styles.overlayEmptyWrap}>
            <EmptyState
              icon="people-outline"
              title="Sin hijos vinculados"
              hint="Cuando el colegio vincule a tus hijos podrás ver su asistencia aquí."
            />
          </View>
        ) : loading && !data ? (
          <LoadingView message="Consultando la asistencia..." />
        ) : sinMatricula ? (
          <View style={styles.overlayEmptyWrap}>
            <EmptyState
              icon="school-outline"
              title="Sin matrícula vigente"
              hint="Cuando el colegio registre la matrícula de este hijo podrás ver su asistencia aquí."
            />
          </View>
        ) : error ? (
          <View style={styles.section}>
            <ErrorCard error={error} onRetry={reload} />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.attValue}>{porcentaje(data?.porcentaje)}</Text>
                  <Text style={styles.summaryLabel}>Asistencia efectiva</Text>
                </View>
                <View style={styles.courseChip}>
                  <Text style={styles.courseChipText}>
                    {data?.bimestreNombre || 'Año completo'}
                  </Text>
                </View>
              </View>

              <View style={styles.attTrack}>
                <View style={[styles.attFill, { width: fill }]} />
              </View>

              <View style={styles.attPills}>
                <View style={styles.attPill}>
                  <Text style={styles.attPillValue}>{data?.total ?? 0}</Text>
                  <Text style={styles.attPillLabel}>Registradas</Text>
                </View>
                <View style={styles.attPill}>
                  <Text style={styles.attPillValue}>{data?.efectivas ?? 0}</Text>
                  <Text style={styles.attPillLabel}>Efectivas</Text>
                </View>
                <View style={styles.attPill}>
                  <Text style={styles.attPillValue}>{data?.faltas ?? 0}</Text>
                  <Text style={styles.attPillLabel}>Faltas</Text>
                </View>
              </View>

              <Text style={styles.summaryFootnote}>
                Presente, tardanza y justificada cuentan como asistencia efectiva.
              </Text>

              <TouchableOpacity
                style={styles.scheduleLink}
                activeOpacity={0.85}
                onPress={onOpenHorario}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                <Text style={styles.scheduleLinkText}>Ver horario de clases</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <SectionTitle title="Historial por día" />
              {detalle.length === 0 ? (
                <EmptyState
                  icon="calendar-outline"
                  title="Sin registros de asistencia"
                  hint="Los docentes aún no han registrado asistencia en este período."
                />
              ) : (
                <AsistenciaHistorial items={detalle} renderAcciones={renderAcciones} />
              )}
            </View>

            <Text style={styles.footNote}>
              El porcentaje se calcula sobre las asistencias registradas. Las faltas
              justificadas pasan a contar como efectivas.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

AsistenciaView.propTypes = {
  onJustificar: PropTypes.func.isRequired,
  onGoJustificaciones: PropTypes.func.isRequired,
  onOpenHorario: PropTypes.func.isRequired,
};
