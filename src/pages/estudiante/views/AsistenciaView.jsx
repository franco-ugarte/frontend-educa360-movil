import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useStudentData } from '../data';
import { useApi } from '../../../hooks/useApi';
import { misAsistencias } from '../../../api/estudiante';
import BimestrePicker from '../../../components/ui/BimestrePicker';
import SectionTitle from '../../../components/ui/SectionTitle';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { styles } from '../styles';
import { asistenciaTone, colors } from '../../../theme';
import { diaMes, hora, porcentaje } from '../../../utils/format';

export default function AsistenciaView() {
  const { bimestres } = useStudentData();
  const [bimestreId, setBimestreId] = useState(null);

  const { data, loading, error, reload } = useApi(
    () => misAsistencias({ bimestreId }),
    [bimestreId]
  );

  const periodos = useMemo(
    () => [
      { id: null, label: 'Año completo' },
      ...bimestres.map((b) => ({ id: b.id, label: `Bim. ${b.numero}` })),
    ],
    [bimestres]
  );

  const detalle = useMemo(() => {
    const list = [...(data?.detalle || [])];
    return list.sort((a, b) => {
      const byDate = String(b.fecha).localeCompare(String(a.fecha));
      if (byDate !== 0) return byDate;
      return String(b.horaInicio || '').localeCompare(String(a.horaInicio || ''));
    });
  }, [data]);

  const pct = Number(data?.porcentaje ?? 0);
  const fill = `${Math.max(0, Math.min(100, pct))}%`;
  const sinMatricula = error?.status === 404;

  return (
    <View style={styles.viewBody}>
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
        {loading && !data ? (
          <LoadingView message="Consultando tu asistencia..." />
        ) : sinMatricula ? (
          <View style={styles.overlayEmptyWrap}>
            <EmptyState
              icon="school-outline"
              title="Sin matrícula vigente"
              hint="Cuando el colegio registre tu matrícula podrás ver tu asistencia aquí."
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
            </View>

            <View style={styles.section}>
              <SectionTitle title="Historial" />
              {detalle.length === 0 ? (
                <EmptyState
                  icon="calendar-outline"
                  title="Sin registros de asistencia"
                  hint="Tus docentes aún no han registrado asistencia en este período."
                />
              ) : (
                detalle.map((item) => {
                  const tone = asistenciaTone[item.estado] || {
                    bg: colors.surfaceAlt,
                    text: colors.muted,
                    label: item.estado || '—',
                  };
                  const fecha = diaMes(item.fecha);
                  return (
                    <View key={item.id} style={styles.attRow}>
                      <View style={styles.attDateBox}>
                        <Text style={styles.attDay}>{fecha.day}</Text>
                        <Text style={styles.attMonth}>{fecha.month}</Text>
                      </View>
                      <View style={styles.attInfo}>
                        <Text style={styles.attMateria} numberOfLines={1}>
                          {item.materiaNombre}
                        </Text>
                        <Text style={styles.attTime}>
                          {hora(item.horaInicio)} – {hora(item.horaFin)}
                        </Text>
                        {item.observacion ? (
                          <Text style={styles.attObs} numberOfLines={2}>
                            {item.observacion}
                          </Text>
                        ) : null}
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.attStatusText, { color: tone.text }]}>{tone.label}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <Text style={styles.footNote}>
              El porcentaje se calcula sobre las asistencias registradas.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
