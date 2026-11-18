import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import { useDocenteData } from '../data';
import { useApi } from '../../../hooks/useApi';
import { asistenciaClase, registrarAsistencia, resumenAsistencia } from '../../../api/docente';
import CoursePicker from '../components/CoursePicker';
import AttendanceRow from '../components/AttendanceRow';
import SectionTitle from '../../../components/ui/SectionTitle';
import LoadingView from '../../../components/ui/LoadingView';
import ErrorCard, { friendlyError } from '../../../components/ui/ErrorCard';
import EmptyState from '../../../components/ui/EmptyState';
import { colors } from '../../../theme';
import { fechaCorta, hora, toApiDate } from '../../../utils/format';
import {
  DIA_CORTO,
  DIA_LARGO,
  ajustarAlDiaBloque,
  bimestreAbiertoDeFecha,
  bimestreDeFecha,
  diaDeFecha,
  fechaSugeridaParaBloque,
  hoySinHora,
  sumarDias,
} from '../agenda';
import { styles } from '../styles';

function eleccionDeEstado(estado) {
  if (estado === 'FALTA') return 'falta';
  if (estado) return 'asistio';
  return null;
}

function semilla(data) {
  const filas = {};
  (data?.asistencias || []).forEach((alumno) => {
    filas[alumno.matriculaId] = {
      choice: eleccionDeEstado(alumno.estado),
      obs: alumno.observacion || '',
      obsOpen: false,
    };
  });
  return filas;
}

/** Traduce el error del backend a una acción concreta para el docente. */
function mensajeDeError(error) {
  if (!error) return 'No se pudo guardar la asistencia.';
  if (error.status === 409) {
    return (
      error.message ||
      'No se puede modificar: una asistencia ya está JUSTIFICADA o el bimestre no está abierto.'
    );
  }
  if (error.status === 404) {
    return 'El curso, bloque o matrícula ya no está disponible. Actualiza la lista.';
  }
  if (error.status === 400 && error.message) return error.message;
  return friendlyError(error);
}

export default function AsistenciaView({ prefill, onConsumePrefill }) {
  const {
    cursos,
    curso,
    selectCurso,
    horariosDelCurso,
    cursoBimestres,
    refreshResumenHoy,
    loading,
    error,
    refresh,
  } = useDocenteData();

  const [bloqueId, setBloqueId] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [rows, setRows] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerNotice, setPickerNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const hoy = useMemo(() => hoySinHora(), []);
  const hoyDia = diaDeFecha(hoy);

  // Si el curso cambia, el bloque anterior deja de pertenecer al horario.
  useEffect(() => {
    if (!curso) {
      setBloqueId(null);
      return;
    }
    const bloques = horariosDelCurso || [];
    if (bloques.some((b) => b.id === bloqueId)) return;
    const preferido =
      bloques.find((b) => b.dia === hoyDia) || bloques[0] || null;
    setBloqueId(preferido?.id ?? null);
  }, [curso?.id, horariosDelCurso, bloqueId, hoyDia]);

  // Prefill desde Inicio/Horario: curso y bloque de la clase tocada.
  useEffect(() => {
    if (!prefill) return;
    if (prefill.cursoId && curso?.id && prefill.cursoId !== curso.id) return;
    if (
      prefill.bloqueId &&
      (horariosDelCurso || []).some((b) => b.id === prefill.bloqueId)
    ) {
      setBloqueId(prefill.bloqueId);
    }
    onConsumePrefill?.();
  }, [prefill, curso?.id, horariosDelCurso, onConsumePrefill]);

  const bloque = useMemo(
    () => (horariosDelCurso || []).find((b) => b.id === bloqueId) || null,
    [horariosDelCurso, bloqueId]
  );

  // Fecha inicial: el día más reciente del bloque dentro de un bimestre abierto.
  useEffect(() => {
    if (!bloque) {
      setFecha(null);
      return;
    }
    setFecha(fechaSugeridaParaBloque(bloque, cursoBimestres));
    setShowPicker(false);
    setPickerNotice(null);
  }, [bloque?.id, cursoBimestres]);

  const apiFecha = useMemo(() => (fecha ? toApiDate(fecha) : null), [fecha]);

  const {
    data,
    loading: loadingRoster,
    error: rosterError,
    reload,
  } = useApi(
    () =>
      curso && bloqueId && apiFecha
        ? asistenciaClase(curso.id, { bloqueId, fecha: apiFecha })
        : Promise.resolve(null),
    [curso?.id, bloqueId, apiFecha]
  );

  const vigente = Boolean(
    data && data.bloqueId === bloqueId && data.fecha === apiFecha
  );

  // Avance del día elegido (GET /docente/asistencias/resumen).
  const { data: resumenDia, reload: reloadResumen } = useApi(
    () =>
      apiFecha
        ? resumenAsistencia({ fecha: apiFecha })
        : Promise.resolve(null),
    [apiFecha]
  );

  const filasResumen = Array.isArray(resumenDia)
    ? resumenDia
    : resumenDia?.bloques || [];
  const totalBloquesDia =
    Number(resumenDia?.totalBloques) || filasResumen.length;
  const bloquesCompletos =
    Number(resumenDia?.bloquesCompletos) ||
    filasResumen.filter((fila) => Number(fila.pendientes) === 0).length;

  useEffect(() => {
    setRows(vigente ? semilla(data) : {});
    setSaveError(null);
  }, [vigente, data]);

  const alumnos = vigente ? data.asistencias || [] : [];

  const cambios = useMemo(() => {
    if (!vigente) return [];
    return (data.asistencias || []).reduce((lista, alumno) => {
      if (alumno.estado === 'JUSTIFICADA') return lista;
      const fila = rows[alumno.matriculaId];
      if (!fila || fila.choice == null) return lista;

      const actual = eleccionDeEstado(alumno.estado);
      const obs = (fila.obs || '').trim();
      const obsCambio = obs !== (alumno.observacion || '').trim();
      if (fila.choice === actual && !obsCambio) return lista;

      lista.push({
        matriculaId: alumno.matriculaId,
        asistio: fila.choice === 'asistio',
        observacion: obs || null,
      });
      return lista;
    }, []);
  }, [vigente, data, rows]);

  const esDirty = (alumno) => {
    if (alumno.estado === 'JUSTIFICADA') return false;
    const fila = rows[alumno.matriculaId];
    if (!fila) return false;
    const actual = eleccionDeEstado(alumno.estado);
    return (
      fila.choice !== actual ||
      (fila.obs || '').trim() !== (alumno.observacion || '').trim()
    );
  };

  const total = alumnos.length;
  const registrados = alumnos.filter(
    (alumno) => rows[alumno.matriculaId]?.choice != null
  ).length;
  const faltas = alumnos.filter(
    (alumno) => rows[alumno.matriculaId]?.choice === 'falta'
  ).length;
  const justificadas = alumnos.filter(
    (alumno) => alumno.estado === 'JUSTIFICADA'
  ).length;
  const pendientes = total - registrados;

  const bimestre = bimestreDeFecha(cursoBimestres, fecha);
  const abierto = bimestreAbiertoDeFecha(cursoBimestres, fecha);
  const puedeGuardar = Boolean(abierto) && vigente && !saving;

  let bimestreMensaje = 'Este año no tiene bimestres configurados.';
  if (bimestre) {
    if (bimestre.estado === 'ABIERTO') {
      bimestreMensaje = `${bimestre.nombre} está abierto: puedes registrar asistencia.`;
    } else if (bimestre.estado === 'PLANIFICADO') {
      bimestreMensaje = `${bimestre.nombre} está planificado: aún no se registra asistencia.`;
    } else {
      bimestreMensaje = `${bimestre.nombre} está cerrado: no se registra asistencia.`;
    }
  } else if (cursoBimestres.length) {
    bimestreMensaje = 'La fecha elegida no pertenece a ningún bimestre del año.';
  }

  const cambiarChoice = (matriculaId, choice) => {
    setRows((prev) => ({
      ...prev,
      [matriculaId]: {
        ...(prev[matriculaId] || { obs: '', obsOpen: false }),
        choice,
      },
    }));
    setSuccess(null);
    setSaveError(null);
  };

  const toggleObs = (matriculaId) => {
    setRows((prev) => ({
      ...prev,
      [matriculaId]: {
        ...(prev[matriculaId] || { choice: null, obs: '' }),
        obsOpen: !prev[matriculaId]?.obsOpen,
      },
    }));
  };

  const cambiarObs = (matriculaId, text) => {
    setRows((prev) => ({
      ...prev,
      [matriculaId]: {
        ...(prev[matriculaId] || { choice: null }),
        obs: text,
      },
    }));
    setSuccess(null);
    setSaveError(null);
  };

  const marcarPendientes = () => {
    setRows((prev) => {
      const next = { ...prev };
      alumnos.forEach((alumno) => {
        if (alumno.estado === 'JUSTIFICADA') return;
        const fila = next[alumno.matriculaId] || { obs: '', obsOpen: false };
        if (fila.choice == null) {
          next[alumno.matriculaId] = { ...fila, choice: 'asistio' };
        }
      });
      return next;
    });
    setSuccess(null);
    setSaveError(null);
  };

  const restablecer = () => {
    if (!cambios.length) return;
    Alert.alert(
      'Restablecer cambios',
      'Se descartarán los cambios que aún no guardaste.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setRows(semilla(data));
            setSaveError(null);
            setSuccess(null);
          },
        },
      ]
    );
  };

  const moverSemana = (semanas) => {
    if (!fecha) return;
    const siguiente = sumarDias(fecha, semanas * 7);
    if (siguiente > hoy) return;
    setFecha(siguiente);
    setPickerNotice(null);
    setSuccess(null);
    setSaveError(null);
  };

  const cambiarFecha = (event, date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (event?.type === 'set' && date) {
      const limpia = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const ajustada = ajustarAlDiaBloque(limpia, bloque?.dia);
      setFecha(ajustada);
      setPickerNotice(
        ajustada.getTime() !== limpia.getTime()
          ? `Se ajustó a ${DIA_LARGO[bloque?.dia]} ${fechaCorta(ajustada)}.`
          : null
      );
      setSuccess(null);
      setSaveError(null);
    }
  };

  const irHoy = () => {
    setFecha(hoy);
    setPickerNotice(null);
    setSuccess(null);
    setSaveError(null);
  };

  const guardar = async () => {
    if (!cambios.length || !puedeGuardar || !curso) return;
    setSaving(true);
    setSaveError(null);
    setSuccess(null);
    try {
      await registrarAsistencia(curso.id, {
        bloqueId,
        fecha: apiFecha,
        asistencias: cambios,
      });
      const actualizado = await reload();
      // El resumen de hoy y del día elegido cambian con lo recién guardado.
      refreshResumenHoy();
      reloadResumen();
      if (actualizado) {
        setSuccess(
          `Asistencia guardada: ${cambios.length} ${
            cambios.length === 1 ? 'registro' : 'registros'
          }.`
        );
      } else {
        setSaveError(
          'Se guardó la asistencia, pero no se pudo refrescar la lista. Vuelve a cargar la fecha.'
        );
      }
    } catch (e) {
      setSaveError(mensajeDeError(e));
    } finally {
      setSaving(false);
    }
  };

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

  const bloques = horariosDelCurso || [];
  const siguienteBloque = bloque ? sumarDias(fecha || hoy, 7) : null;
  const nextDisabled = !fecha || !siguienteBloque || siguienteBloque > hoy;
  const hoyDisponible =
    bloque && hoyDia === bloque.dia && fecha && fecha.getTime() !== hoy.getTime();

  return (
    <View style={styles.viewBody}>
      <CoursePicker
        cursos={cursos}
        selectedId={curso?.id}
        onSelect={selectCurso}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.attendanceScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!curso ? (
          <View style={styles.overlayEmptyWrap}>
            <EmptyState
              icon="book-outline"
              title="Sin cursos asignados"
              hint="Cuando el colegio te asigne cursos podrás tomar asistencia."
            />
          </View>
        ) : bloques.length === 0 ? (
          <View style={styles.overlayEmptyWrap}>
            <EmptyState
              icon="calendar-outline"
              title="Sin bloques de horario"
              hint="El colegio aún no ha registrado el horario de este curso."
            />
          </View>
        ) : !bloque || !fecha ? (
          <LoadingView message="Preparando la hoja de asistencia..." />
        ) : (
          <>
            <View style={styles.attControlsCard}>
              <Text style={styles.attControlLabel}>Bloque</Text>
              <ScrollView
                horizontal
                style={styles.filterScroll}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.attBlockRow}
              >
                {bloques.map((item) => {
                  const activo = item.id === bloqueId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.attBlockChip,
                        activo && styles.attBlockChipActive,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setBloqueId(item.id)}
                    >
                      <Text
                        style={[
                          styles.attBlockDay,
                          activo && styles.attBlockDayActive,
                        ]}
                      >
                        {DIA_CORTO[item.dia] || item.dia}
                      </Text>
                      <Text
                        style={[
                          styles.attBlockTime,
                          activo && styles.attBlockTimeActive,
                        ]}
                      >
                        {hora(item.horaInicio)} – {hora(item.horaFin)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.attControlLabel}>Fecha</Text>
              <View style={styles.attDateRow}>
                <TouchableOpacity
                  style={styles.attDateArrow}
                  activeOpacity={0.85}
                  onPress={() => moverSemana(-1)}
                  accessibilityLabel="Semana anterior"
                >
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attDateField}
                  activeOpacity={0.85}
                  onPress={() => setShowPicker((v) => !v)}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <View style={styles.attDateTextBox}>
                    <Text style={styles.attDateText}>
                      {DIA_LARGO[bloque.dia]} {fechaCorta(fecha)}
                    </Text>
                    <Text style={styles.attDateHint}>
                      {hora(bloque.horaInicio)} – {hora(bloque.horaFin)} ·{' '}
                      {curso.seccionEtiqueta}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={16} color={colors.muted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.attDateArrow,
                    nextDisabled && styles.attDateArrowDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={nextDisabled}
                  onPress={() => moverSemana(1)}
                  accessibilityLabel="Semana siguiente"
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={nextDisabled ? colors.faint : colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {showPicker ? (
                <View style={styles.pickerBox}>
                  <DateTimePicker
                    value={fecha}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={hoy}
                    onChange={cambiarFecha}
                    locale="es-PE"
                  />
                  {Platform.OS === 'ios' ? (
                    <TouchableOpacity
                      style={styles.pickerDone}
                      onPress={() => setShowPicker(false)}
                    >
                      <Text style={styles.pickerDoneText}>Listo</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {hoyDisponible ? (
                <TouchableOpacity
                  style={styles.attTodayBtn}
                  activeOpacity={0.85}
                  onPress={irHoy}
                >
                  <Ionicons name="today-outline" size={14} color={colors.primary} />
                  <Text style={styles.attTodayText}>Ir a hoy</Text>
                </TouchableOpacity>
              ) : null}

              {pickerNotice ? (
                <Text style={styles.attPickerNotice}>{pickerNotice}</Text>
              ) : null}

              <View
                style={[
                  styles.attBimestreRow,
                  abierto ? styles.attBimestreOpen : styles.attBimestreWarn,
                ]}
              >
                <Ionicons
                  name={abierto ? 'lock-open-outline' : 'alert-circle-outline'}
                  size={14}
                  color={abierto ? colors.successText : colors.warningText}
                />
                <Text
                  style={[
                    styles.attBimestreText,
                    abierto
                      ? styles.attBimestreTextOpen
                      : styles.attBimestreTextWarn,
                  ]}
                >
                  {bimestreMensaje}
                </Text>
              </View>

              {filasResumen.length ? (
                <View style={styles.attResumenRow}>
                  <Ionicons
                    name="stats-chart-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={styles.attResumenText}>
                    Ese día: {bloquesCompletos} de {totalBloquesDia}{' '}
                    {totalBloquesDia === 1 ? 'clase completa' : 'clases completas'}
                  </Text>
                </View>
              ) : null}
            </View>

            {loadingRoster && !vigente ? (
              <LoadingView message="Cargando la lista de alumnos..." />
            ) : rosterError && !vigente ? (
              <View style={styles.section}>
                <ErrorCard error={rosterError} onRetry={reload} />
              </View>
            ) : vigente ? (
              <>
                <View style={styles.attSummaryCard}>
                  <View style={styles.attSummaryTop}>
                    <View>
                      <Text style={styles.attSummaryValue}>
                        {registrados}/{total}
                      </Text>
                      <Text style={styles.attSummaryLabel}>Registrados</Text>
                    </View>
                    <View style={styles.attSummaryPills}>
                      <View style={styles.attMiniPill}>
                        <Text style={styles.attMiniPillValue}>{faltas}</Text>
                        <Text style={styles.attMiniPillLabel}>Faltas</Text>
                      </View>
                      <View style={styles.attMiniPill}>
                        <Text style={styles.attMiniPillValue}>{justificadas}</Text>
                        <Text style={styles.attMiniPillLabel}>Justificadas</Text>
                      </View>
                      <View style={styles.attMiniPill}>
                        <Text style={styles.attMiniPillValue}>{pendientes}</Text>
                        <Text style={styles.attMiniPillLabel}>Pendientes</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.attActionRow}>
                    <TouchableOpacity
                      style={[
                        styles.attBulkBtn,
                        (pendientes === 0 || saving) && styles.attBulkBtnDisabled,
                      ]}
                      activeOpacity={0.85}
                      disabled={pendientes === 0 || saving}
                      onPress={marcarPendientes}
                    >
                      <Ionicons
                        name="checkmark-done-outline"
                        size={15}
                        color={colors.primary}
                      />
                      <Text style={styles.attBulkText}>Marcar pendientes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.attResetBtn,
                        (!cambios.length || saving) && styles.attBulkBtnDisabled,
                      ]}
                      activeOpacity={0.85}
                      disabled={!cambios.length || saving}
                      onPress={restablecer}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={15}
                        color={colors.muted}
                      />
                      <Text style={styles.attResetText}>Restablecer</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {success ? (
                  <View style={styles.attSuccess}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color={colors.successText}
                    />
                    <Text style={styles.attSuccessText}>{success}</Text>
                  </View>
                ) : null}

                {saveError ? (
                  <View style={styles.attErrorBanner}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={colors.dangerText}
                    />
                    <Text style={styles.attErrorText}>{saveError}</Text>
                  </View>
                ) : null}

                <View style={styles.section}>
                  <SectionTitle title="Lista de alumnos" />
                  {alumnos.length === 0 ? (
                    <EmptyState
                      icon="people-outline"
                      title="Sin alumnos matriculados"
                      hint="La sección de este curso aún no tiene matrículas activas."
                    />
                  ) : (
                    alumnos.map((alumno) => (
                      <AttendanceRow
                        key={alumno.matriculaId}
                        alumno={alumno}
                        row={
                          rows[alumno.matriculaId] || {
                            choice: null,
                            obs: '',
                            obsOpen: false,
                          }
                        }
                        dirty={esDirty(alumno)}
                        saving={saving}
                        onChangeChoice={(choice) =>
                          cambiarChoice(alumno.matriculaId, choice)
                        }
                        onToggleObs={() => toggleObs(alumno.matriculaId)}
                        onChangeObs={(text) =>
                          cambiarObs(alumno.matriculaId, text)
                        }
                      />
                    ))
                  )}
                </View>

                <Text style={styles.footNote}>
                  El estado Tardanza lo calcula el servidor con la hora de
                  registro. La justificación aprobada por Secretaría queda
                  bloqueada.
                </Text>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      {vigente && alumnos.length > 0 ? (
        <View style={styles.attSaveBar}>
          <View style={styles.attSaveInfo}>
            <Text style={styles.attSaveTitle}>
              {cambios.length
                ? `${cambios.length} ${
                    cambios.length === 1 ? 'cambio' : 'cambios'
                  } sin guardar`
                : 'Sin cambios pendientes'}
            </Text>
            <Text style={styles.attSaveHint}>
              {puedeGuardar
                ? 'Listo para guardar'
                : 'La fecha no permite registrar'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.attSaveBtn,
              (!cambios.length || !puedeGuardar || saving) &&
                styles.attSaveBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!cambios.length || !puedeGuardar || saving}
            onPress={guardar}
          >
            <Ionicons
              name={saving ? 'hourglass-outline' : 'save-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.attSaveBtnText}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

AsistenciaView.propTypes = {
  prefill: PropTypes.shape({
    cursoId: PropTypes.number,
    bloqueId: PropTypes.number,
  }),
  onConsumePrefill: PropTypes.func,
};
