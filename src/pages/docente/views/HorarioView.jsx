import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useDocenteData } from '../data';
import SectionTitle from '../../../components/ui/SectionTitle';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { hora } from '../../../utils/format';
import {
  DIA_LARGO,
  agruparPorDia,
  diaDeFecha,
  duracion,
  hoySinHora,
  minutosDeBloque,
} from '../../../utils/horario';
import { styles } from '../styles';

export default function HorarioView({ onTomarAsistencia }) {
  const { cursos, horario, loading, refreshing, error, refresh } = useDocenteData();
  const [filtro, setFiltro] = useState(null);

  const hoyDia = useMemo(() => diaDeFecha(hoySinHora()), []);
  const filtroActivo = cursos.some((curso) => curso.id === filtro) ? filtro : null;

  const cursoDe = useMemo(() => {
    const mapa = {};
    cursos.forEach((curso) => {
      mapa[curso.id] = curso;
    });
    return mapa;
  }, [cursos]);

  const bloquesPorCurso = useMemo(() => {
    const mapa = {};
    (horario || []).forEach((bloque) => {
      mapa[bloque.cursoId] = (mapa[bloque.cursoId] || 0) + 1;
    });
    return mapa;
  }, [horario]);

  const visibles = useMemo(
    () => (horario || []).filter((bloque) => !filtroActivo || bloque.cursoId === filtroActivo),
    [horario, filtroActivo]
  );
  const grupos = useMemo(() => agruparPorDia(visibles), [visibles]);
  const minutos = useMemo(
    () => visibles.reduce((total, bloque) => total + minutosDeBloque(bloque), 0),
    [visibles]
  );
  const materias = useMemo(
    () => new Set(visibles.map((bloque) => bloque.materiaNombre)).size,
    [visibles]
  );
  const secciones = useMemo(
    () => new Set(cursos.map((curso) => curso.seccionId)).size,
    [cursos]
  );

  if (loading && !cursos.length) {
    return <LoadingView message="Cargando tu horario..." />;
  }

  if (error && !cursos.length) {
    return (
      <View style={styles.section}>
        <ErrorCard error={error} onRetry={() => refresh()} />
      </View>
    );
  }

  if (!cursos.length) {
    return (
      <View style={styles.overlayEmptyWrap}>
        <EmptyState
          icon="book-outline"
          title="Sin cursos asignados"
          hint="Cuando el colegio te asigne cursos verás aquí tu horario semanal."
        />
      </View>
    );
  }

  return (
    <View style={styles.viewBody}>
      <ScrollView
        horizontal
        style={styles.filterScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.filterChip, !filtroActivo && styles.filterChipActive]}
          activeOpacity={0.85}
          onPress={() => setFiltro(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              !filtroActivo && styles.filterChipTextActive,
            ]}
          >
            Todos
          </Text>
          <Text
            style={[styles.filterCount, !filtroActivo && styles.filterCountActive]}
          >
            {horario.length}
          </Text>
        </TouchableOpacity>

        {cursos.map((curso) => {
          const activo = curso.id === filtroActivo;
          return (
            <TouchableOpacity
              key={curso.id}
              style={[styles.filterChip, activo && styles.filterChipActive]}
              activeOpacity={0.85}
              onPress={() => setFiltro(curso.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activo && styles.filterChipTextActive,
                ]}
              >
                {curso.materiaNombre}
              </Text>
              <Text
                style={[styles.filterCount, activo && styles.filterCountActive]}
              >
                {bloquesPorCurso[curso.id] || 0}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
        <View style={styles.scheduleSummary}>
          <View style={styles.scheduleSummaryIcon}>
            <Ionicons name="calendar-outline" size={22} color="#5F348F" />
          </View>
          <View style={styles.scheduleSummaryInfo}>
            <Text style={styles.scheduleSummaryName} numberOfLines={1}>
              {filtroActivo
                ? `${cursoDe[filtroActivo]?.materiaNombre} · ${
                    cursoDe[filtroActivo]?.seccionEtiqueta
                  }`
                : `${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'} · ${secciones} ${
                    secciones === 1 ? 'sección' : 'secciones'
                  }`}
            </Text>
            <Text style={styles.scheduleSummaryMeta} numberOfLines={1}>
              {materias} {materias === 1 ? 'materia' : 'materias'} · {grupos.length}{' '}
              {grupos.length === 1 ? 'día' : 'días'} · {visibles.length}{' '}
              {visibles.length === 1 ? 'bloque' : 'bloques'} · {duracion(minutos)} por
              semana
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.section}>
            <ErrorCard error={error} onRetry={() => refresh({ silent: true })} />
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionTitle title="Semana completa" />
          {grupos.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Sin bloques de horario"
              hint="El colegio aún no ha registrado el horario de tus cursos."
            />
          ) : (
            grupos.map((grupo) => (
              <View key={grupo.dia} style={styles.dayGroup}>
                <View style={styles.dayHead}>
                  <Text style={styles.dayName}>{DIA_LARGO[grupo.dia]}</Text>
                  {grupo.dia === hoyDia ? (
                    <View style={styles.todayChip}>
                      <Text style={styles.todayChipText}>Hoy</Text>
                    </View>
                  ) : null}
                  <Text style={styles.dayCount}>
                    {grupo.bloques.length}{' '}
                    {grupo.bloques.length === 1 ? 'bloque' : 'bloques'}
                  </Text>
                </View>

                {grupo.bloques.map((bloque) => {
                  const cursoDelBloque = cursoDe[bloque.cursoId];
                  return (
                    <View key={bloque.id} style={styles.scheduleBlock}>
                      <View style={styles.scheduleTimeBox}>
                        <Text style={styles.scheduleTime}>{hora(bloque.horaInicio)}</Text>
                        <Text style={styles.scheduleTimeEnd}>{hora(bloque.horaFin)}</Text>
                      </View>
                      <View style={styles.scheduleInfo}>
                        <Text style={styles.scheduleName} numberOfLines={1}>
                          {bloque.materiaNombre}
                        </Text>
                        <Text style={styles.scheduleMeta} numberOfLines={1}>
                          {cursoDelBloque?.seccionEtiqueta || 'Sección'} ·{' '}
                          {cursoDelBloque?.cantidadAlumnos ?? 0} alumnos ·{' '}
                          {duracion(minutosDeBloque(bloque))}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.scheduleButton}
                        activeOpacity={0.85}
                        onPress={() =>
                          onTomarAsistencia({
                            cursoId: bloque.cursoId,
                            bloqueId: bloque.id,
                          })
                        }
                      >
                        <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
                        <Text style={styles.scheduleButtonText}>Asistencia</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>

        <Text style={styles.footNote}>
          La asistencia sólo se registra en fechas del bimestre abierto.
        </Text>
      </ScrollView>
    </View>
  );
}

HorarioView.propTypes = {
  onTomarAsistencia: PropTypes.func.isRequired,
};
