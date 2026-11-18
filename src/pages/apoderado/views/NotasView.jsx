import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApoderadoData } from '../data';
import { useApi } from '../../../hooks/useApi';
import { calificacionesHijo } from '../../../api/apoderado';
import ChildPicker from '../components/ChildPicker';
import BimestrePicker from '../../../components/ui/BimestrePicker';
import SectionTitle from '../../../components/ui/SectionTitle';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import SemaforoBadge, {
  SemaforoDot,
  SemaforoLegend,
} from '../../../components/ui/SemaforoBadge';
import { styles } from '../styles';
import { nota, semaforoNota } from '../../../utils/format';

export default function NotasView() {
  const { hijos, hijo, selectChild, childBimestres } = useApoderadoData();
  const [bimestreId, setBimestreId] = useState(null);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    setBimestreId(null);
    setAbierto(null);
  }, [hijo?.estudianteId]);

  const { data, loading, error, reload } = useApi(
    () =>
      hijo
        ? calificacionesHijo(hijo.estudianteId, { bimestreId })
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

  const cursos = data?.promediosCurso || [];
  const scope = bimestreId ? 'Promedio del bimestre' : 'Promedio del año';
  const sinMatricula = error?.status === 404;

  const cambiarPeriodo = (id) => {
    setBimestreId(id);
    setAbierto(null);
  };

  return (
    <View style={styles.viewBody}>
      <ChildPicker hijos={hijos} selectedId={hijo?.estudianteId} onSelect={selectChild} />

      <View style={{ paddingTop: 14, paddingBottom: 4 }}>
        <BimestrePicker items={periodos} value={bimestreId} onChange={cambiarPeriodo} />
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
              hint="Cuando el colegio vincule a tus hijos podrás ver sus calificaciones aquí."
            />
          </View>
        ) : loading && !data ? (
          <LoadingView message="Consultando las notas..." />
        ) : sinMatricula ? (
          <View style={styles.overlayEmptyWrap}>
            <EmptyState
              icon="school-outline"
              title="Sin matrícula vigente"
              hint="Cuando el colegio registre la matrícula de este hijo podrás ver sus notas aquí."
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
                  <Text style={styles.summaryValue}>{nota(data?.promedioGeneral)}</Text>
                  <Text style={styles.summaryLabel}>{scope}</Text>
                  <View style={styles.summaryBadge}>
                    <SemaforoBadge value={data?.promedioGeneral} />
                  </View>
                </View>
                <View style={styles.courseChip}>
                  <Text style={styles.courseChipText}>Escala 0 – 20</Text>
                </View>
              </View>
              <Text style={styles.summaryFootnote}>
                {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'} con notas
                {data?.bimestreNombre ? ` · ${data.bimestreNombre}` : ''}
              </Text>
            </View>

            <View style={styles.section}>
              <SectionTitle title="Por curso" />
              {cursos.length > 0 ? <SemaforoLegend /> : null}
              {cursos.length === 0 ? (
                <EmptyState
                  icon="stats-chart-outline"
                  title="Aún no hay notas publicadas"
                  hint="Cuando los docentes publiquen calificaciones, verás aquí los promedios."
                />
              ) : (
                cursos.map((curso) => {
                  const isOpen = abierto === curso.cursoId;
                  const unidades = (data?.promediosUnidad || []).filter(
                    (u) => u.cursoId === curso.cursoId
                  );
                  return (
                    <TouchableOpacity
                      key={curso.cursoId}
                      style={styles.gradeCard}
                      activeOpacity={0.9}
                      onPress={() => setAbierto(isOpen ? null : curso.cursoId)}
                    >
                      <View style={styles.gradeTop}>
                        <View style={styles.courseIcon}>
                          <Ionicons name="school-outline" size={18} color="#5F348F" />
                        </View>
                        <View style={styles.gradeInfo}>
                          <Text style={styles.gradeName} numberOfLines={2}>
                            {curso.materiaNombre}
                          </Text>
                          <Text style={styles.gradeSub}>
                            {unidades.length}{' '}
                            {unidades.length === 1
                              ? 'unidad con notas'
                              : 'unidades con notas'}
                          </Text>
                        </View>
                        <View style={styles.gradeValueWrap}>
                          <SemaforoDot value={curso.promedio} size={8} />
                          <Text
                            style={[
                              curso.promedio == null
                                ? styles.gradeValueEmpty
                                : styles.gradeValue,
                              curso.promedio != null && {
                                color: semaforoNota(curso.promedio)?.text,
                              },
                            ]}
                          >
                            {nota(curso.promedio)}
                          </Text>
                        </View>
                        <View style={styles.chevronBox}>
                          <Ionicons
                            name={isOpen ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            color="#64748B"
                          />
                        </View>
                      </View>

                      {isOpen ? (
                        <View style={styles.unitBox}>
                          {unidades.length === 0 ? (
                            <Text style={styles.unitSub}>Sin unidades calificadas.</Text>
                          ) : (
                            unidades.map((unidad) => {
                              const criterios = (data?.detalle || []).filter(
                                (d) => d.unidadId === unidad.unidadId
                              );
                              return (
                                <View key={unidad.unidadId}>
                                  <View style={styles.unitRow}>
                                    <View style={styles.unitTitleBox}>
                                      <Text style={styles.unitTitle} numberOfLines={2}>
                                        U{unidad.unidadNumero} · {unidad.unidadTitulo}
                                      </Text>
                                      <Text style={styles.unitSub}>
                                        {unidad.bimestreNombre} · {unidad.cantidad}{' '}
                                        {unidad.cantidad === 1 ? 'nota' : 'notas'}
                                      </Text>
                                    </View>
                                    <Text style={styles.unitNota}>
                                      {nota(unidad.promedio)}
                                    </Text>
                                  </View>
                                  {criterios.length > 0 ? (
                                    <View style={styles.critList}>
                                      {criterios.map((detalle) => (
                                        <View key={detalle.id} style={styles.critRow}>
                                          <Text
                                            style={styles.critName}
                                            numberOfLines={1}
                                          >
                                            {detalle.criterio}
                                          </Text>
                                          <Text style={styles.critNota}>
                                            {nota(detalle.nota)}
                                          </Text>
                                        </View>
                                      ))}
                                    </View>
                                  ) : null}
                                </View>
                              );
                            })
                          )}
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <Text style={styles.footNote}>
              Sólo se muestran las notas de unidades publicadas por los docentes.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
