import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import { crearTicket, subirSustento } from '../../../api/apoderado';
import { colors } from '../../../theme';
import { diaSemana, fechaCorta, hora, toApiDate } from '../../../utils/format';
import {
  MAX_SUSTENTO_BYTES,
  elegirImagen,
  elegirPdf,
  formDataDeSustento,
} from '../adjunto';
import { styles } from '../styles';

function hoySinHora() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fechaDesdeApi(text) {
  const [anio, mes, dia] = String(text || '').slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return hoySinHora();
  return new Date(anio, mes - 1, dia);
}

/** Traduce el error del backend a un mensaje útil para el apoderado. */
function mensajeDeError(e) {
  if (!e) return 'No se pudo registrar la justificación.';
  if (e.status === 409) {
    return 'Ya existe una justificación activa para esa fecha o bloque. Revisa el historial de este hijo.';
  }
  if (e.status === 404) {
    return 'La fecha elegida no tiene matrícula o bloque válido para este hijo.';
  }
  return e.message || 'No se pudo registrar la justificación.';
}

/** Activos que realmente chocan con la fecha y el alcance elegidos. */
function conflictosEn(lista, apiFecha, bloqueId) {
  return (lista || []).filter(
    (t) =>
      t.estado !== 'RECHAZADO' &&
      t.fechaInasistencia === apiFecha &&
      (bloqueId == null || t.bloqueId == null || t.bloqueId === bloqueId)
  );
}

function mensajeConflicto(conflictos, fecha) {
  const diaCompleto = conflictos.some((t) => t.bloqueId == null);
  const aprobada = conflictos.some((t) => t.estado === 'APROBADO');
  return `Ya existe una justificación ${aprobada ? 'aprobada' : 'pendiente'} para el ${fechaCorta(
    fecha
  )} (${diaCompleto ? 'día completo' : 'ese bloque'}). Está en el historial de este hijo.`;
}

/**
 * Alta de una justificación para el hijo activo. El alcance por defecto es
 * "día completo"; los bloques se ofrecen a partir de las faltas registradas
 * de esa fecha, que son las que el backend acepta para ese alumno.
 */
export default function JustificacionForm({
  hijo,
  tickets = [],
  asistencias,
  open,
  onOpenChange,
  prefill,
  onConsumePrefill,
  onCreated,
  onSuccess,
  onRefreshTickets,
}) {
  const [fecha, setFecha] = useState(hoySinHora);
  const [bloqueId, setBloqueId] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [adjunto, setAdjunto] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const enviandoRef = useRef(false);

  const apiFecha = toApiDate(fecha);

  const activos = useMemo(
    () =>
      (tickets || []).filter(
        (t) => t.estado !== 'RECHAZADO' && t.fechaInasistencia === apiFecha
      ),
    [tickets, apiFecha]
  );

  const hayActivo = activos.length > 0;

  const bloqueBloqueado = (id) =>
    activos.some((t) => t.bloqueId == null || t.bloqueId === id);

  const bloques = useMemo(() => {
    const filas = (asistencias?.detalle || []).filter(
      (d) => d.estado === 'FALTA' && d.fecha === apiFecha && d.bloqueId != null
    );
    const unicos = new Map();
    filas.forEach((fila) => {
      if (!unicos.has(fila.bloqueId)) unicos.set(fila.bloqueId, fila);
    });
    return [...unicos.values()].sort((a, b) =>
      String(a.horaInicio || '').localeCompare(String(b.horaInicio || ''))
    );
  }, [asistencias, apiFecha]);

  // Al cambiar de hijo se limpia el formulario para no mezclar datos.
  useEffect(() => {
    setFecha(hoySinHora());
    setBloqueId(null);
    setMotivo('');
    setAdjunto(null);
    setError(null);
    setSaving(false);
    setShowPicker(false);
  }, [hijo?.estudianteId]);

  // Prefill desde Asistencia: fecha + bloque de la falta tocada.
  useEffect(() => {
    if (!prefill) return;
    setFecha(fechaDesdeApi(prefill.fecha));
    setBloqueId(prefill.bloqueId ?? null);
    setMotivo('');
    setAdjunto(null);
    setError(null);
    onOpenChange?.(true);
    onConsumePrefill?.();
  }, [prefill, onOpenChange, onConsumePrefill]);

  const cambiarFecha = (event, date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (event?.type === 'set' && date) {
      const limpia = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      setFecha(limpia);
      setBloqueId(null);
      setError(null);
    }
  };

  const agregarAdjunto = (asset) => {
    if (!asset) return;
    const bytes = asset.fileSize ?? asset.size ?? 0;
    if (bytes > MAX_SUSTENTO_BYTES) {
      setError('El archivo supera los 5 MB. Elige uno más liviano.');
      return;
    }
    setError(null);
    setAdjunto(asset);
  };

  const elegir = async (origen) => {
    setError(null);
    try {
      const asset =
        origen === 'pdf' ? await elegirPdf() : await elegirImagen(origen);
      if (asset) agregarAdjunto(asset);
    } catch (e) {
      setError(
        e?.message || 'No se pudo abrir la cámara, la galería o el selector de archivos.'
      );
    }
  };

  const bloqueInvalido = bloqueId == null ? hayActivo : bloqueBloqueado(bloqueId);
  const sinMatricula = !hijo?.seccionEtiqueta;
  const retirado = hijo?.situacionFinal === 'RETIRADO';
  const bloqueadoPorMatricula = sinMatricula || retirado;
  const adjuntoEsPdf = /pdf/i.test(
    `${adjunto?.mimeType || ''} ${adjunto?.name || ''} ${adjunto?.fileName || ''}`
  );

  const enviar = async () => {
    if (!hijo || saving) return;
    const texto = motivo.trim();

    if (bloqueadoPorMatricula) {
      setError(
        retirado
          ? 'La matrícula está retirada: no se pueden justificar inasistencias.'
          : 'Este hijo no tiene matrícula vigente en el año actual.'
      );
      return;
    }
    if (!texto) {
      setError('Escribe el motivo de la inasistencia.');
      return;
    }
    if (!apiFecha) {
      setError('Selecciona una fecha válida.');
      return;
    }
    if (bloqueInvalido) {
      setError(
        bloqueId == null
          ? 'Ya existe una justificación activa para ese día.'
          : 'Ya existe una justificación activa para ese bloque.'
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const ticket = await crearTicket(hijo.estudianteId, {
        fechaInasistencia: apiFecha,
        motivo: texto,
        ...(bloqueId != null ? { bloqueId } : {}),
      });
      onCreated?.(ticket);

      let mensaje = 'Justificación registrada. Secretaría la revisará.';
      if (adjunto) {
        try {
          const form = await formDataDeSustento(adjunto);
          const actualizado = await subirSustento(ticket.id, form);
          onCreated?.(actualizado || ticket);
          mensaje =
            'Justificación registrada con su sustento. Secretaría la revisará.';
        } catch (e) {
          mensaje = e?.message
            ? `Justificación registrada, pero no se pudo subir el archivo: ${e.message}`
            : 'Justificación registrada, pero no se pudo subir el archivo. Puedes adjuntarlo desde la lista.';
        }
      }

      setFecha(hoySinHora());
      setBloqueId(null);
      setMotivo('');
      setAdjunto(null);
      setShowPicker(false);
      onOpenChange?.(false);
      onSuccess?.(mensaje);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formCard}>
      <TouchableOpacity
        style={styles.formHeader}
        activeOpacity={0.85}
        onPress={() => onOpenChange?.(!open)}
      >
        <View style={styles.formHeaderIcon}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.formHeaderTextBox}>
          <Text style={styles.formTitle}>Nueva justificación</Text>
          <Text style={styles.formSubtitle} numberOfLines={1}>
            {open
              ? `Para ${hijo?.nombres || 'tu hijo'}`
              : 'Registra una inasistencia con sustento'}
          </Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.muted}
        />
      </TouchableOpacity>

      {open ? (
        <View style={styles.formBody}>
          {bloqueadoPorMatricula ? (
            <View style={[styles.formWarning, { marginTop: 0, marginBottom: 12 }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.warningText} />
              <Text style={styles.formWarningText}>
                {retirado
                  ? 'La matrícula de este hijo está retirada: no se pueden registrar justificaciones.'
                  : 'Este hijo no tiene matrícula vigente. Contacta a Secretaría para regularizar su matrícula.'}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.formLabel, styles.formLabelFirst]}>
            Fecha de la inasistencia
          </Text>
          <TouchableOpacity
            style={styles.dateField}
            activeOpacity={0.85}
            onPress={() => setShowPicker((v) => !v)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dateFieldText}>
                {diaSemana(fecha)} {fechaCorta(fecha)}
              </Text>
              <Text style={styles.dateFieldHint}>
                No se pueden justificar fechas futuras
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </TouchableOpacity>

          {showPicker ? (
            <View style={styles.pickerBox}>
              <DateTimePicker
                value={fecha}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                maximumDate={hoySinHora()}
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

          <Text style={styles.formLabel}>Alcance</Text>
          <TouchableOpacity
            style={[
              styles.scopeOption,
              bloqueId == null && styles.scopeOptionActive,
              hayActivo && { opacity: 0.5 },
            ]}
            activeOpacity={0.85}
            disabled={hayActivo}
            onPress={() => setBloqueId(null)}
          >
            <View
              style={[styles.scopeRadio, bloqueId == null && styles.scopeRadioActive]}
            >
              {bloqueId == null ? <View style={styles.scopeRadioDot} /> : null}
            </View>
            <View style={styles.scopeTextBox}>
              <Text
                style={[
                  styles.scopeTitle,
                  bloqueId == null && styles.scopeTitleActive,
                ]}
              >
                Día completo
              </Text>
              <Text style={styles.scopeHint}>Cubre todas las clases de la fecha</Text>
            </View>
            <Ionicons name="sunny-outline" size={18} color={colors.faint} />
          </TouchableOpacity>

          {bloques.map((bloque) => {
            const blocked = bloqueBloqueado(bloque.bloqueId);
            const active = bloqueId === bloque.bloqueId;
            return (
              <TouchableOpacity
                key={bloque.bloqueId}
                style={[
                  styles.scopeOption,
                  active && styles.scopeOptionActive,
                  blocked && { opacity: 0.45 },
                ]}
                activeOpacity={0.85}
                disabled={blocked}
                onPress={() => setBloqueId(bloque.bloqueId)}
              >
                <View
                  style={[styles.scopeRadio, active && styles.scopeRadioActive]}
                >
                  {active ? <View style={styles.scopeRadioDot} /> : null}
                </View>
                <View style={styles.scopeTextBox}>
                  <Text
                    style={[styles.scopeTitle, active && styles.scopeTitleActive]}
                    numberOfLines={1}
                  >
                    {bloque.materiaNombre}
                  </Text>
                  <Text style={styles.scopeHint}>
                    {hora(bloque.horaInicio)} – {hora(bloque.horaFin)}
                    {blocked ? ' · Ya justificado' : ''}
                  </Text>
                </View>
                <Ionicons name="book-outline" size={18} color={colors.faint} />
              </TouchableOpacity>
            );
          })}

          {bloques.length === 0 ? (
            <Text style={styles.scopeHint}>
              No hay faltas registradas ese día: la justificación cubrirá el día
              completo.
            </Text>
          ) : null}

          {hayActivo ? (
            <View style={styles.formWarning}>
              <Ionicons name="warning-outline" size={16} color={colors.warningText} />
              <Text style={styles.formWarningText}>
                Ya existe una justificación activa para esta fecha. Elige otro
                bloque o espera la resolución de Secretaría.
              </Text>
            </View>
          ) : null}

          <Text style={styles.formLabel}>Motivo</Text>
          <TextInput
            style={styles.formInput}
            multiline
            value={motivo}
            onChangeText={(text) => {
              setMotivo(text);
              if (error) setError(null);
            }}
            placeholder="Ej.: Cita médica, trámite familiar…"
            placeholderTextColor={colors.faint}
            maxLength={500}
            editable={!saving}
          />
          <Text style={styles.formInputCounter}>{motivo.length}/500</Text>

          <Text style={styles.formLabel}>Sustento (opcional)</Text>
          <View style={styles.attachButtonsRow}>
            <TouchableOpacity
              style={styles.attachBtn}
              activeOpacity={0.85}
              disabled={saving}
              onPress={() => elegir('camera')}
            >
              <Ionicons name="camera-outline" size={17} color={colors.primary} />
              <Text style={styles.attachBtnText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachBtn}
              activeOpacity={0.85}
              disabled={saving}
              onPress={() => elegir('library')}
            >
              <Ionicons name="images-outline" size={17} color={colors.primary} />
              <Text style={styles.attachBtnText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachBtn}
              activeOpacity={0.85}
              disabled={saving}
              onPress={() => elegir('pdf')}
            >
              <Ionicons name="document-outline" size={17} color={colors.primary} />
              <Text style={styles.attachBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>

          {adjunto ? (
            <View style={styles.attachPreview}>
              {adjuntoEsPdf ? (
                <View style={[styles.attachImage, styles.attachPdfBox]}>
                  <Ionicons
                    name="document-text-outline"
                    size={26}
                    color={colors.primary}
                  />
                </View>
              ) : (
                <Image source={{ uri: adjunto.uri }} style={styles.attachImage} />
              )}
              <View style={styles.attachFileBox}>
                <Text style={styles.attachFileName} numberOfLines={1}>
                  {adjunto.fileName || adjunto.name || 'Archivo seleccionado'}
                </Text>
                <Text style={styles.attachFileHint}>
                  {adjuntoEsPdf ? 'PDF adjunto' : 'Se adjuntará al ticket'} · máx. 5 MB
                </Text>
              </View>
              <TouchableOpacity
                style={styles.attachRemove}
                onPress={() => setAdjunto(null)}
                accessibilityLabel="Quitar archivo"
              >
                <Ionicons name="close" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.attachFileHint}>
              Foto o PDF de la receta o constancia (JPG, PNG o PDF, máx. 5 MB).
            </Text>
          )}

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (saving || bloqueInvalido || bloqueadoPorMatricula) &&
                styles.submitBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={saving || bloqueInvalido || bloqueadoPorMatricula}
            onPress={enviar}
          >
            <Ionicons
              name={saving ? 'hourglass-outline' : 'send-outline'}
              size={17}
              color="#FFFFFF"
            />
            <Text style={styles.submitBtnText}>
              {saving ? 'Enviando…' : 'Registrar justificación'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

JustificacionForm.propTypes = {
  hijo: PropTypes.object,
  tickets: PropTypes.array,
  asistencias: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  prefill: PropTypes.shape({
    fecha: PropTypes.string,
    bloqueId: PropTypes.number,
  }),
  onConsumePrefill: PropTypes.func,
  onCreated: PropTypes.func,
  onSuccess: PropTypes.func,
};
