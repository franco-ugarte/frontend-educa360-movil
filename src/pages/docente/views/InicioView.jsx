import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useAuth } from '../../../state/AuthContext';
import { useDocenteData } from '../data';
import SectionTitle from '../../../components/ui/SectionTitle';
import QuickAction from '../../../components/ui/QuickAction';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { displayName } from '../../../api/mappers';
import { colors } from '../../../theme';
import { fechaCorta, fechaRelativa, hora } from '../../../utils/format';
import {
  DIA_LARGO,
  diaDeFecha,
  hoySinHora,
  minutosDeBloque,
  sumarDias,
} from '../agenda';
import { styles } from '../styles';

function horasSemanales(bloques) {
  const minutos = (bloques || []).reduce(
    (total, bloque) => total + minutosDeBloque(bloque),
    0
  );
  const horas = minutos / 60;
  return Number.isInteger(horas) ? `${horas} h` : `${horas.toFixed(1)} h`;
}

export default function InicioView({
  onNavigate,
  onOpenComunicados,
  onTomarAsistencia,
  onNuevoAviso,
}) {
  const { user, perfil } = useAuth();
  const {
    cursos,
    horarios,
    totalAlumnos,
    resumenHoy,
    resumenHoyMeta,
    comunicados,
    loading,
    refreshing,
    error,
    refresh,
  } = useDocenteData();

  const hoy = useMemo(() => hoySinHora(), []);
  const hoyDia = diaDeFecha(hoy);

  const resumenPorBloque = useMemo(() => {
    const mapa = {};
    (resumenHoy || []).forEach((fila) => {
      mapa[`${fila.cursoId}-${fila.bloqueId}`] = fila;
    });
    return mapa;
  }, [resumenHoy]);

  const clasesHoy = useMemo(() => {
    const lista = [];
    cursos.forEach((curso) => {
      (horarios[curso.id] || []).forEach((bloque) => {
        if (bloque.dia === hoyDia) lista.push({ ...bloque, curso });
      });
    });
    return lista.sort((a, b) =>
      String(a.horaInicio).localeCompare(String(b.horaInicio))
    );
  }, [cursos, horarios, hoyDia]);

  const proxima = useMemo(() => {
    if (clasesHoy.length) return null;
    for (let offset = 1; offset <= 7; offset += 1) {
      const fecha = sumarDias(hoy, offset);
      const dia = diaDeFecha(fecha);
      const lista = [];
      cursos.forEach((curso) => {
        (horarios[curso.id] || []).forEach((bloque) => {
          if (bloque.dia === dia) lista.push({ ...bloque, curso, fecha });
        });
      });
      if (lista.length) {
        lista.sort((a, b) =>
          String(a.horaInicio).localeCompare(String(b.horaInicio))
        );
        return { dia, fecha, clases: lista };
      }
    }
    return null;
  }, [clasesHoy, cursos, horarios, hoy]);

  const secciones = useMemo(
    () => new Set(cursos.map((c) => c.seccionId)).size,
    [cursos]
  );

  const progreso = useMemo(() => {
    if (resumenHoyMeta) {
      return {
        completas: resumenHoyMeta.bloquesCompletos,
        total: resumenHoyMeta.totalBloques,
      };
    }
    const completas = clasesHoy.filter((bloque) => {
      const fila = resumenPorBloque[`${bloque.curso.id}-${bloque.id}`];
      return fila && Number(fila.pendientes) === 0;
    }).length;
    return { completas, total: clasesHoy.length };
  }, [clasesHoy, resumenPorBloque, resumenHoyMeta]);

  if (loading && !cursos.length) {
    return <LoadingView message="Cargando tus cursos..." />;
  }

  if (error && !cursos.length) {
    return (
      <View style={styles.section}>
        <ErrorCard error={error} onRetry={() => refresh()} />
      </View>
    );
  }

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
      <View style={styles.teacherCard}>
        <View style={styles.teacherCardTop}>
          <View style={styles.teacherCardIcon}>
            <Ionicons name="easel-outline" size={22} color="#5F348F" />
          </View>
          <View style={styles.teacherCardInfo}>
            <Text style={styles.teacherCardName} numberOfLines={1}>
              {displayName(user)}
            </Text>
            <Text style={styles.teacherCardMeta} numberOfLines={1}>
              {perfil?.titulo || 'Docente'} · Educa360
            </Text>
          </View>
        </View>

        <View style={styles.teacherStatsRow}>
          <View style={styles.teacherStat}>
            <Text style={styles.teacherStatValue}>{cursos.length}</Text>
            <Text style={styles.teacherStatLabel}>Cursos</Text>
          </View>
          <View style={styles.teacherStatDivider} />
          <View style={styles.teacherStat}>
            <Text style={styles.teacherStatValue}>{secciones}</Text>
            <Text style={styles.teacherStatLabel}>
              {secciones === 1 ? 'Sección' : 'Secciones'}
            </Text>
          </View>
          <View style={styles.teacherStatDivider} />
          <View style={styles.teacherStat}>
            <Text style={styles.teacherStatValue}>{totalAlumnos}</Text>
            <Text style={styles.teacherStatLabel}>Alumnos</Text>
          </View>
          <View style={styles.teacherStatDivider} />
          <View style={styles.teacherStat}>
            <Text style={styles.teacherStatValue}>{comunicados.length}</Text>
            <Text style={styles.teacherStatLabel}>Avisos</Text>
          </View>
        </View>
      </View>

      {error ? (
        <View style={styles.section}>
          <ErrorCard error={error} onRetry={() => refresh({ silent: true })} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle
          title="Clases de hoy"
          actionLabel={clasesHoy.length ? 'Ver horario' : undefined}
          onAction={() => onNavigate('horario')}
        />

        {progreso.total > 0 ? (
          <View style={styles.classesProgressRow}>
            <Ionicons
              name="stats-chart-outline"
              size={13}
              color={colors.primary}
            />
            <Text style={styles.classesProgress}>
              {progreso.completas} de {progreso.total}{' '}
              {progreso.total === 1 ? 'clase' : 'clases'} con lista pasada
            </Text>
          </View>
        ) : null}

        {clasesHoy.length === 0 ? (
          <EmptyState
            icon="cafe-outline"
            title="Hoy no tienes clases"
            hint={
              proxima
                ? `Tu próxima clase es ${DIA_LARGO[proxima.dia]} ${fechaCorta(
                    proxima.fecha
                  )} a las ${hora(proxima.clases[0].horaInicio)} · ${
                    proxima.clases[0].curso.materiaNombre
                  }.`
                : 'Aún no hay bloques registrados en tu horario.'
            }
          />
        ) : (
          clasesHoy.map((bloque) => {
            const fila = resumenPorBloque[`${bloque.curso.id}-${bloque.id}`];
            const totalClase = Number(fila?.totalAlumnos) || 0;
            const registradas = Number(fila?.registradas) || 0;
            const completo = Boolean(fila) && Number(fila.pendientes) === 0;

            return (
              <View key={bloque.id} style={styles.classCard}>
                <View style={styles.classTimeBox}>
                  <Text style={styles.classTime}>{hora(bloque.horaInicio)}</Text>
                  <Text style={styles.classTimeEnd}>{hora(bloque.horaFin)}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.className} numberOfLines={1}>
                    {bloque.curso.materiaNombre}
                  </Text>
                  <Text style={styles.classMeta} numberOfLines={1}>
                    {bloque.curso.seccionEtiqueta} · {bloque.curso.anioNombre}
                  </Text>
                  {fila ? (
                    <View style={styles.classAttendanceRow}>
                      <Ionicons
                        name={
                          completo ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={12}
                        color={
                          completo ? colors.successText : colors.warningText
                        }
                      />
                      <Text
                        style={[
                          styles.classAttendanceText,
                          completo
                            ? styles.classAttendanceDone
                            : styles.classAttendanceEmpty,
                        ]}
                      >
                        {registradas}/{totalClase} registradas ·{' '}
                        {completo ? 'Completo' : 'Pendiente'}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.classButton}
                  activeOpacity={0.85}
                  onPress={() =>
                    onTomarAsistencia({
                      cursoId: bloque.curso.id,
                      bloqueId: bloque.id,
                    })
                  }
                >
                  <Ionicons name="checkmark-done" size={15} color="#FFFFFF" />
                  <Text style={styles.classButtonText}>
                    {fila && !completo ? 'Completar' : 'Asistencia'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle title="Accesos rápidos" />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="checkmark-done-outline"
            label="Tomar asistencia"
            hint="Por bloque y fecha"
            tone="green"
            onPress={() => onNavigate('asistencia')}
          />
          <QuickAction
            icon="create-outline"
            label="Nuevo aviso"
            hint="Mensaje express"
            tone="amber"
            onPress={onNuevoAviso}
          />
          <QuickAction
            icon="calendar-outline"
            label="Mi horario"
            hint="Clases de la semana"
            tone="blue"
            onPress={() => onNavigate('horario')}
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
          title="Tus cursos"
          actionLabel={cursos.length ? 'Ver horario' : undefined}
          onAction={() => onNavigate('horario')}
        />
        {cursos.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title="Sin cursos asignados"
            hint="Cuando el colegio te asigne cursos podrás tomar asistencia y publicar avisos."
          />
        ) : (
          cursos.map((curso) => {
            const bloques = horarios[curso.id] || [];
            return (
              <View key={curso.id} style={styles.subjectCard}>
                <View style={styles.subjectIcon}>
                  <Ionicons name="book-outline" size={17} color="#5F348F" />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName} numberOfLines={1}>
                    {curso.materiaNombre}
                  </Text>
                  <Text style={styles.subjectMeta} numberOfLines={1}>
                    {curso.seccionEtiqueta} · {curso.anioNombre} ·{' '}
                    {horasSemanales(bloques)} / semana ·{' '}
                    {curso.cantidadAlumnos ?? 0} alumnos
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.subjectButton}
                  activeOpacity={0.85}
                  onPress={() => onTomarAsistencia({ cursoId: curso.id })}
                >
                  <Text style={styles.subjectButtonText}>Asistencia</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Avisos recientes"
          actionLabel={comunicados.length ? 'Ver todos' : undefined}
          onAction={() => onNavigate('avisos')}
        />
        {comunicados.length === 0 ? (
          <EmptyState
            icon="megaphone-outline"
            title="Aún no hay avisos"
            hint="Publica un aviso express para mantener informadas a las familias de tus secciones."
            actionLabel="Crear aviso"
            onAction={onNuevoAviso}
          />
        ) : (
          comunicados.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.noticeCard}
              activeOpacity={0.85}
              onPress={() => onNavigate('avisos')}
            >
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
                <View style={styles.noticeChip}>
                  <Text style={styles.noticeChipText}>
                    {item.seccionEtiqueta || 'General'}
                  </Text>
                </View>
              </View>
              <Text style={styles.noticeBody} numberOfLines={3}>
                {item.contenido}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <Text style={styles.footNote}>
        Planificación, materiales y actas están en la versión web.
      </Text>
    </ScrollView>
  );
}

InicioView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onOpenComunicados: PropTypes.func.isRequired,
  onTomarAsistencia: PropTypes.func.isRequired,
  onNuevoAviso: PropTypes.func.isRequired,
};
