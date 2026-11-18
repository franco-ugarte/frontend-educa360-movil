import React, { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useAuth } from '../../../state/AuthContext';
import { useStudentData } from '../data';
import SectionTitle from '../../../components/ui/SectionTitle';
import QuickAction from '../../../components/ui/QuickAction';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { styles } from '../styles';
import { displayName } from '../../../api/mappers';
import {
  fechaRelativa,
  hora,
  iniciales,
  nota,
  porcentaje,
  semaforoNota,
  situacionLabel,
} from '../../../utils/format';
import {
  diaDeFecha,
  duracion,
  hoySinHora,
  minutosDeBloque,
} from '../../../utils/horario';

export default function InicioView({ onNavigate, onOpenComunicados }) {
  const { user } = useAuth();
  const {
    matricula,
    cursos,
    horario,
    calificaciones,
    asistencias,
    comunicados,
    loading,
    refreshing,
    error,
    refresh,
  } = useStudentData();

  const hoyDia = useMemo(() => diaDeFecha(hoySinHora()), []);
  const clasesHoy = useMemo(
    () =>
      (horario || [])
        .filter((bloque) => bloque.dia === hoyDia)
        .sort((a, b) => String(a.horaInicio).localeCompare(String(b.horaInicio))),
    [horario, hoyDia]
  );

  const nombre = displayName(user);
  const initials = iniciales(user?.nombres, user?.apellidos);
  const tonePromedio = semaforoNota(calificaciones?.promedioGeneral);
  const seccion = matricula
    ? `${matricula.seccionEtiqueta} · ${matricula.anioNombre}`
    : 'Sin matrícula vigente';
  const estado = matricula ? situacionLabel(matricula.situacionFinal) : 'Sin matrícula';

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
      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={2}>{nombre}</Text>
            <Text style={styles.profileMeta} numberOfLines={1}>{seccion}</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{estado}</Text>
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
            <Text style={styles.statValue}>{porcentaje(asistencias?.porcentaje)}</Text>
            <Text style={styles.statLabel}>Asistencia</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statValue, styles.statValueAccent]}>{cursos.length || '—'}</Text>
            <Text style={styles.statLabel}>Cursos</Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.section}>
          <ErrorCard error={error} onRetry={() => refresh()} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle title="Accesos rápidos" />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="calendar-outline"
            label="Horario"
            hint="Tu semana"
            tone="purple"
            onPress={() => onNavigate('horario')}
          />
          <QuickAction
            icon="stats-chart-outline"
            label="Notas"
            hint="Promedios"
            tone="green"
            onPress={() => onNavigate('notas')}
          />
          <QuickAction
            icon="checkmark-done-outline"
            label="Asistencia"
            hint="Tu registro"
            tone="blue"
            onPress={() => onNavigate('asistencia')}
          />
          <QuickAction
            icon="megaphone-outline"
            label="Comunicados"
            hint="Avisos del cole"
            tone="amber"
            onPress={onOpenComunicados}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Clases de hoy"
          actionLabel={horario.length ? 'Ver horario' : undefined}
          onAction={() => onNavigate('horario')}
        />
        {clasesHoy.length === 0 ? (
          <EmptyState
            icon="cafe-outline"
            title={horario.length ? 'Hoy no tienes clases' : 'Sin horario registrado'}
            hint={
              horario.length
                ? 'Tu próximo día con clases aparece en la pestaña Horario.'
                : 'Cuando el colegio registre el horario de tu sección lo verás aquí.'
            }
          />
        ) : (
          clasesHoy.map((bloque) => (
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
          ))
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
            hint="Los avisos del colegio y de tus docentes aparecerán aquí."
          />
        ) : (
          comunicados.slice(0, 2).map((item) => (
            <View key={item.id} style={styles.noticeCard}>
              <View style={styles.noticeHead}>
                <View style={styles.noticeAvatar}>
                  <Ionicons name="megaphone" size={15} color="#5F348F" />
                </View>
                <View style={styles.noticeAuthorBox}>
                  <Text style={styles.noticeAuthor} numberOfLines={1}>{item.autorNombre}</Text>
                  <Text style={styles.noticeDate}>{fechaRelativa(item.createdAt)}</Text>
                </View>
              </View>
              <Text style={styles.noticeBody} numberOfLines={3}>{item.contenido}</Text>
              <View style={styles.noticeChip}>
                <Text style={styles.noticeChipText}>
                  {item.seccionEtiqueta ? `Sección ${item.seccionEtiqueta}` : 'General'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {loading ? <Text style={styles.footNote}>Actualizando tu información…</Text> : null}
      <Text style={styles.footNote}>
        Educa360 · Colegio Nuestra Señora de Monserrat
      </Text>
    </ScrollView>
  );
}

InicioView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onOpenComunicados: PropTypes.func.isRequired,
};
