import React, { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudentData } from '../data';
import SectionTitle from '../../../components/ui/SectionTitle';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorCard from '../../../components/ui/ErrorCard';
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

export default function HorarioView() {
  const { horario, matricula, refreshing, error, refresh } = useStudentData();

  const hoyDia = useMemo(() => diaDeFecha(hoySinHora()), []);
  const grupos = useMemo(() => agruparPorDia(horario), [horario]);
  const minutos = useMemo(
    () => (horario || []).reduce((total, bloque) => total + minutosDeBloque(bloque), 0),
    [horario]
  );

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
      {!matricula ? (
        <View style={styles.overlayEmptyWrap}>
          <EmptyState
            icon="school-outline"
            title="Sin matrícula vigente"
            hint="Cuando el colegio registre tu matrícula verás aquí tu horario semanal."
          />
        </View>
      ) : (
        <>
          <View style={styles.scheduleSummary}>
            <View style={styles.scheduleSummaryIcon}>
              <Ionicons name="calendar-outline" size={22} color="#5F348F" />
            </View>
            <View style={styles.scheduleSummaryInfo}>
              <Text style={styles.scheduleSummaryName} numberOfLines={1}>
                {matricula.seccionEtiqueta} · {matricula.anioNombre}
              </Text>
              <Text style={styles.scheduleSummaryMeta} numberOfLines={1}>
                {grupos.length} {grupos.length === 1 ? 'día' : 'días'} de clases ·{' '}
                {horario.length} {horario.length === 1 ? 'bloque' : 'bloques'} ·{' '}
                {duracion(minutos)} por semana
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.section}>
              <ErrorCard error={error} onRetry={() => refresh()} />
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionTitle title="Tu semana" />
            {grupos.length === 0 ? (
              <EmptyState
                icon="time-outline"
                title="Sin bloques de horario"
                hint="El colegio aún no ha registrado el horario de tu sección."
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

                  {grupo.bloques.map((bloque) => (
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
                          {bloque.docenteNombre} · {duracion(minutosDeBloque(bloque))}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>

          <Text style={styles.footNote}>
            El horario lo actualiza el colegio. Las descargas y el detalle completo
            están disponibles en la web.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
