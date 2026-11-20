import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useApoderadoData } from '../data';
import { subirSustento, urlSustento } from '../../../api/apoderado';
import {
  MAX_SUSTENTO_BYTES,
  elegirImagen,
  elegirPdf,
  formDataDeSustento,
} from '../adjunto';
import ChildPicker from '../components/ChildPicker';
import JustificacionForm from '../components/JustificacionForm';
import TicketCard from '../components/TicketCard';
import SectionTitle from '../../../components/ui/SectionTitle';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { colors } from '../../../theme';
import { styles } from '../styles';

const FILTROS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'PENDIENTE', label: 'Pendientes' },
  { id: 'APROBADO', label: 'Aprobadas' },
  { id: 'RECHAZADO', label: 'Rechazadas' },
];

function mensajeSustento(e, accion) {
  if (!e) return `No se pudo ${accion} el sustento.`;
  if (e.status === 409) {
    return 'El ticket ya fue resuelto: ya no se puede adjuntar sustento.';
  }
  if (e.status === 404) {
    return 'El sustento ya no está disponible.';
  }
  if (e.status === 400) {
    return e.message || 'El archivo no es válido (JPG, PNG o PDF, máx. 5 MB).';
  }
  return e.message || `No se pudo ${accion} el sustento.`;
}

export default function JustificacionesView({ prefill, onConsumePrefill }) {
  const {
    hijos,
    hijo,
    selectChild,
    tickets,
    asistencias,
    childLoaded,
    childLoading,
    childError,
    refreshing,
    error,
    refresh,
    refreshTickets,
    upsertTicket,
  } = useApoderadoData();

  const [formOpen, setFormOpen] = useState(false);
  const [filtro, setFiltro] = useState('TODAS');
  const [notice, setNotice] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const initialized = useRef(false);

  // Con historial el formulario arranca cerrado; sin historial, abierto.
  useEffect(() => {
    if (initialized.current || !childLoaded) return;
    initialized.current = true;
    setFormOpen(tickets.length === 0);
  }, [childLoaded, tickets.length]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(
    () => ({
      TODAS: tickets.length,
      PENDIENTE: tickets.filter((t) => t.estado === 'PENDIENTE').length,
      APROBADO: tickets.filter((t) => t.estado === 'APROBADO').length,
      RECHAZADO: tickets.filter((t) => t.estado === 'RECHAZADO').length,
    }),
    [tickets]
  );

  const visibles = useMemo(
    () =>
      filtro === 'TODAS' ? tickets : tickets.filter((t) => t.estado === filtro),
    [tickets, filtro]
  );

  const verSustento = async (ticket) => {
    setActionError(null);
    setViewingId(ticket.id);
    try {
      const result = await urlSustento(ticket.id);
      if (!result?.url) throw new Error('No se pudo obtener el enlace del sustento.');
      await Linking.openURL(result.url);
    } catch (e) {
      setActionError(mensajeSustento(e, 'abrir'));
    } finally {
      setViewingId(null);
    }
  };

  const adjuntar = async (ticket, origen) => {
    setActionError(null);
    setNotice(null);
    try {
      const asset =
        origen === 'pdf' ? await elegirPdf() : await elegirImagen(origen);
      if (!asset) return;
      const bytes = asset.fileSize ?? asset.size ?? 0;
      if (bytes > MAX_SUSTENTO_BYTES) {
        setActionError('El archivo supera los 5 MB. Elige uno más liviano.');
        return;
      }
      setBusyId(ticket.id);
      const form = await formDataDeSustento(asset);
      const actualizado = await subirSustento(ticket.id, form);
      upsertTicket(actualizado);
      setNotice('Sustento adjuntado correctamente.');
    } catch (e) {
      setActionError(
        e?.message && !e?.status
          ? e.message
          : mensajeSustento(e, 'adjuntar')
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.viewBody}>
      <ChildPicker hijos={hijos} selectedId={hijo?.estudianteId} onSelect={selectChild} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (childLoading && childLoaded)}
            onRefresh={() => refresh({ silent: true })}
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
              hint="Cuando el colegio vincule a tus hijos podrás registrar sus justificaciones aquí."
            />
            {error ? (
              <View style={{ marginTop: 16 }}>
                <ErrorCard error={error} onRetry={() => refresh()} />
              </View>
            ) : null}
          </View>
        ) : !childLoaded ? (
          <LoadingView message="Cargando las justificaciones..." />
        ) : childError ? (
          <View style={styles.section}>
            <ErrorCard
              error={childError}
              onRetry={() => refresh({ silent: true })}
            />
          </View>
        ) : (
          <>
            {notice ? (
              <View style={styles.successCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.successText}
                />
                <Text style={styles.successText}>{notice}</Text>
              </View>
            ) : null}

            {actionError ? (
              <Text style={[styles.formError, { paddingHorizontal: 16, marginTop: 12 }]}>
                {actionError}
              </Text>
            ) : null}

            <JustificacionForm
              hijo={hijo}
              tickets={tickets}
              asistencias={asistencias}
              open={formOpen}
              onOpenChange={setFormOpen}
              prefill={prefill}
              onConsumePrefill={onConsumePrefill}
              onCreated={upsertTicket}
              onSuccess={(mensaje) => {
                setNotice(mensaje);
                setActionError(null);
                refreshTickets();
              }}
            />

            {tickets.length > 0 ? (
              <ScrollView
                horizontal
                style={styles.filterScroll}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTROS.map((item) => {
                  const active = filtro === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      activeOpacity={0.85}
                      onPress={() => setFiltro(item.id)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          active && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.filterCount,
                          active && styles.filterCountActive,
                        ]}
                      >
                        {counts[item.id]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            <View style={styles.section}>
              <SectionTitle title="Historial" />
              {tickets.length === 0 ? (
                <EmptyState
                  icon="document-text-outline"
                  title="Sin justificaciones registradas"
                  hint="Usa el formulario para justificar una falta. Secretaría revisará la solicitud."
                />
              ) : visibles.length === 0 ? (
                <EmptyState
                  icon="funnel-outline"
                  title="No hay justificaciones en este estado"
                  hint="Prueba con otro filtro para ver el resto del historial."
                />
              ) : (
                visibles.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    busy={busyId === ticket.id}
                    viewing={viewingId === ticket.id}
                    onViewSustento={verSustento}
                    onAttach={adjuntar}
                  />
                ))
              )}
            </View>

            <Text style={styles.footNote}>
              El sustento es opcional. Secretaría resuelve las solicitudes desde la web
              y verás aquí su estado y observaciones.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

JustificacionesView.propTypes = {
  prefill: PropTypes.shape({
    fecha: PropTypes.string,
    bloqueId: PropTypes.number,
  }),
  onConsumePrefill: PropTypes.func,
};
