import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { colors, radius, shadowSoft } from '../../theme';
import {
  activarRecordatorios,
  desactivarRecordatorios,
  enviarRecordatorioPrueba,
  estadoRecordatorios,
  sincronizarRecordatorios,
} from '../../services/recordatorios';

/**
 * Interruptor de recordatorios locales en Perfil (los tres roles).
 *
 * Al encenderlo se pide permiso al sistema y se programan los avisos del
 * horario; al apagarlo se cancelan solo los de Educa360. El botón "Probar
 * notificación local" lanza un aviso inmediato aunque el interruptor esté
 * apagado, para diagnosticar permisos, canal y sonido sin depender del push.
 */
export default function RecordatoriosCard({
  rol,
  horario = [],
  cursos = [],
  nombre,
  seccion,
}) {
  const [estado, setEstado] = useState({
    disponible: true,
    activo: false,
    permiso: true,
  });
  const [ocupado, setOcupado] = useState(false);

  const refrescar = useCallback(async () => {
    setEstado(await estadoRecordatorios());
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const alternar = async (valor) => {
    if (ocupado) return;
    setOcupado(true);
    try {
      if (valor) {
        const resultado = await activarRecordatorios();
        if (!resultado.ok) {
          await refrescar();
          Alert.alert(
            'Notificaciones bloqueadas',
            'Para recibir recordatorios, permite las notificaciones de Educa360 en los ajustes del teléfono.',
            [
              { text: 'Ahora no', style: 'cancel' },
              { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
        await sincronizarRecordatorios({ rol, horario, cursos, nombre, seccion });
      } else {
        await desactivarRecordatorios();
      }
      await refrescar();
    } finally {
      setOcupado(false);
    }
  };

  const probar = async () => {
    const { ok, canAskAgain } = await enviarRecordatorioPrueba();
    if (ok) return;
    await refrescar();
    Alert.alert(
      'Notificaciones bloqueadas',
      'Activa las notificaciones de Educa360 en los ajustes del sistema para probar los avisos.',
      canAskAgain
        ? [{ text: 'Entendido' }]
        : [
            { text: 'Ahora no', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
          ]
    );
  };

  const detalle = !estado.disponible
    ? 'Disponible en la app para Android y iOS.'
    : estado.activo
      ? rol === 'DOCENTE'
        ? 'Aviso 10 min antes de cada clase y recordatorio de asistencia por la mañana.'
        : 'Aviso 10 minutos antes de cada clase del horario.'
      : estado.permiso
        ? 'Actívalos para recibir avisos de clase y asistencia sin abrir la app.'
        : 'Permiso denegado: actívalo en los ajustes del teléfono.';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="notifications-outline" size={19} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Recordatorios locales</Text>
          <Text style={styles.detalle}>{detalle}</Text>
        </View>
        <Switch
          value={estado.activo}
          onValueChange={alternar}
          disabled={ocupado || !estado.disponible}
          trackColor={{ false: colors.line, true: colors.primary }}
          thumbColor={colors.surface}
          accessibilityLabel="Activar recordatorios locales"
        />
      </View>

      {estado.disponible ? (
        <TouchableOpacity
          style={styles.testButton}
          activeOpacity={0.85}
          onPress={probar}
          disabled={ocupado}
        >
          <Ionicons name="paper-plane-outline" size={14} color={colors.primary} />
          <Text style={styles.testText}>Probar notificación local</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

RecordatoriosCard.propTypes = {
  rol: PropTypes.oneOf(['ESTUDIANTE', 'APODERADO', 'DOCENTE']).isRequired,
  horario: PropTypes.array,
  cursos: PropTypes.array,
  nombre: PropTypes.string,
  seccion: PropTypes.string,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    ...shadowSoft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '800', color: colors.text },
  detalle: { fontSize: 10.5, color: colors.muted, marginTop: 2, lineHeight: 15 },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  testText: { fontSize: 11.5, fontWeight: '800', color: colors.primary },
});
