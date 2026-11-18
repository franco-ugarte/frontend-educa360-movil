import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { asistenciaTone, colors } from '../../../theme';
import { iniciales } from '../../../utils/format';
import { styles } from '../styles';

/**
 * Fila de la hoja de asistencia. El docente sólo decide "asistió / falta":
 * TARDANZA y JUSTIFICADA las deriva el backend.
 */
export default function AttendanceRow({
  alumno,
  row,
  dirty,
  saving,
  onChangeChoice,
  onToggleObs,
  onChangeObs,
}) {
  const tone = asistenciaTone[alumno.estado] || null;
  const justificada = alumno.estado === 'JUSTIFICADA';
  const sinRegistro = !alumno.estado && row.choice == null;
  const noteDisabled = justificada || saving || row.choice == null;

  return (
    <View style={[styles.attStudentCard, dirty && styles.attStudentCardDirty]}>
      <View style={styles.attStudentTop}>
        <View style={styles.attStudentAvatar}>
          <Text style={styles.attStudentAvatarText}>
            {iniciales(alumno.estudianteNombre)}
          </Text>
        </View>

        <View style={styles.attStudentInfo}>
          <Text style={styles.attStudentName} numberOfLines={1}>
            {alumno.estudianteNombre}
          </Text>
          <Text style={styles.attStudentDni}>DNI {alumno.estudianteDni}</Text>
          {alumno.observacion ? (
            <Text style={styles.attStudentObs} numberOfLines={2}>
              Nota: {alumno.observacion}
            </Text>
          ) : null}
        </View>

        {tone ? (
          <View style={[styles.attStatePill, { backgroundColor: tone.bg }]}>
            <Text style={[styles.attStateText, { color: tone.text }]}>
              {tone.label}
            </Text>
          </View>
        ) : sinRegistro ? (
          <View style={styles.attPendingPill}>
            <Text style={styles.attPendingText}>Sin registrar</Text>
          </View>
        ) : null}
      </View>

      {justificada ? (
        <View style={styles.attLockedRow}>
          <Ionicons name="lock-closed-outline" size={13} color={colors.infoText} />
          <Text style={styles.attLockedText}>
            Justificada por Secretaría: no se puede modificar.
          </Text>
        </View>
      ) : (
        <View style={styles.attChoiceRow}>
          <TouchableOpacity
            style={[
              styles.attChoiceBtn,
              row.choice === 'asistio' && styles.attChoicePresent,
            ]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={() => onChangeChoice('asistio')}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={row.choice === 'asistio' ? '#FFFFFF' : colors.successText}
            />
            <Text
              style={[
                styles.attChoiceText,
                row.choice === 'asistio' && styles.attChoiceTextActive,
              ]}
            >
              Asistió
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.attChoiceBtn,
              row.choice === 'falta' && styles.attChoiceAbsent,
            ]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={() => onChangeChoice('falta')}
          >
            <Ionicons
              name="close-circle-outline"
              size={16}
              color={row.choice === 'falta' ? '#FFFFFF' : colors.dangerText}
            />
            <Text
              style={[
                styles.attChoiceText,
                row.choice === 'falta' && styles.attChoiceTextActive,
              ]}
            >
              Falta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.attNoteBtn,
              row.obsOpen && styles.attNoteBtnActive,
              noteDisabled && styles.attNoteBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={noteDisabled}
            onPress={onToggleObs}
            accessibilityLabel="Agregar observación"
          >
            <Ionicons
              name={row.obs ? 'chatbubble-ellipses' : 'chatbubble-outline'}
              size={16}
              color={noteDisabled ? colors.faint : colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      {row.obsOpen && !justificada ? (
        <TextInput
          style={styles.attObsInput}
          value={row.obs}
          onChangeText={onChangeObs}
          placeholder="Observación para esta clase (opcional)"
          placeholderTextColor={colors.faint}
          maxLength={200}
          multiline
          editable={!saving}
        />
      ) : null}

      {dirty ? (
        <Text style={styles.attDirtyText}>Cambio sin guardar</Text>
      ) : null}
    </View>
  );
}

AttendanceRow.propTypes = {
  alumno: PropTypes.shape({
    matriculaId: PropTypes.number.isRequired,
    estudianteNombre: PropTypes.string,
    estudianteDni: PropTypes.string,
    estado: PropTypes.string,
    observacion: PropTypes.string,
  }).isRequired,
  row: PropTypes.shape({
    choice: PropTypes.oneOf(['asistio', 'falta', null]),
    obs: PropTypes.string,
    obsOpen: PropTypes.bool,
  }).isRequired,
  dirty: PropTypes.bool,
  saving: PropTypes.bool,
  onChangeChoice: PropTypes.func.isRequired,
  onToggleObs: PropTypes.func.isRequired,
  onChangeObs: PropTypes.func.isRequired,
};
