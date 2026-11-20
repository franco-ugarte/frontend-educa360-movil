import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { colors } from '../../../theme';
import { fechaCorta, fechaRelativa, hora } from '../../../utils/format';
import { styles } from '../styles';

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', bg: colors.warningSoft, text: colors.warningText },
  APROBADO: { label: 'Aprobada', bg: colors.successSoft, text: colors.successText },
  RECHAZADO: { label: 'Rechazada', bg: colors.dangerSoft, text: colors.dangerText },
};

/** Estado visible de un ticket (también lo usa el filtro del historial). */
export function estadoTone(estado) {
  return ESTADOS[estado] || { label: estado || '—', bg: colors.surfaceAlt, text: colors.muted };
}

function MiniButton({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.miniBtn, disabled && { opacity: 0.5 }]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={12} color={colors.primary} />
      <Text style={styles.miniBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

MiniButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default function TicketCard({
  ticket,
  busy = false,
  viewing = false,
  onViewSustento,
  onAttach,
}) {
  const tone = estadoTone(ticket.estado);
  const pendiente = ticket.estado === 'PENDIENTE';
  const conSustento = Boolean(ticket.storagePath);
  const disabled = busy || viewing;
  const alcance = ticket.bloqueId
    ? `${ticket.materiaNombre || 'Bloque'} · ${hora(ticket.horaInicio)} – ${hora(ticket.horaFin)}`
    : 'Día completo';
  const resolucion = ticket.fechaResolucion
    ? `Resuelta ${fechaRelativa(ticket.fechaResolucion)}${
        ticket.resueltoPorNombre ? ` por ${ticket.resueltoPorNombre}` : ''
      }`
    : null;

  return (
    <View style={styles.ticketCard}>
      <View style={styles.ticketTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ticketDate}>{fechaCorta(ticket.fechaInasistencia)}</Text>
          <Text style={styles.ticketScope} numberOfLines={1}>{alcance}</Text>
        </View>
        <View style={[styles.statePill, { backgroundColor: tone.bg }]}>
          <Text style={[styles.stateText, { color: tone.text }]}>{tone.label}</Text>
        </View>
      </View>

      <Text style={styles.ticketReason}>{ticket.motivo}</Text>

      <View style={styles.ticketMetaRow}>
        <Ionicons name="paper-plane-outline" size={12} color={colors.faint} />
        <Text style={styles.ticketMetaText}>
          Solicitada {fechaRelativa(ticket.createdAt)}
        </Text>
      </View>

      {resolucion ? (
        <View style={styles.resolutionBox}>
          <Ionicons
            name={ticket.estado === 'APROBADO' ? 'checkmark-circle-outline' : 'information-circle-outline'}
            size={15}
            color={tone.text}
          />
          <Text style={styles.resolutionText}>{resolucion}</Text>
        </View>
      ) : null}

      {ticket.observacionesAdmin ? (
        <View style={styles.obsBox}>
          <Text style={styles.obsLabel}>Observación de Secretaría</Text>
          <Text style={styles.obsText}>{ticket.observacionesAdmin}</Text>
        </View>
      ) : null}

      <View style={styles.ticketAttach}>
        <View style={styles.ticketAttachInfo}>
          <Ionicons
            name={conSustento ? 'document-attach' : 'document-attach-outline'}
            size={15}
            color={conSustento ? colors.primary : colors.faint}
          />
          <Text style={styles.ticketAttachText}>
            {conSustento ? 'Sustento adjunto' : 'Sin sustento adjunto'}
          </Text>
        </View>

        <View style={styles.ticketActions}>
          {conSustento ? (
            <MiniButton
              icon="eye-outline"
              label="Ver"
              onPress={() => onViewSustento(ticket)}
              disabled={disabled}
            />
          ) : null}
          {pendiente ? (
            <>
              <MiniButton
                icon="camera-outline"
                label="Cámara"
                onPress={() => onAttach(ticket, 'camera')}
                disabled={disabled}
              />
              <MiniButton
                icon="images-outline"
                label="Galería"
                onPress={() => onAttach(ticket, 'library')}
                disabled={disabled}
              />
              <MiniButton
                icon="document-outline"
                label="PDF"
                onPress={() => onAttach(ticket, 'pdf')}
                disabled={disabled}
              />
            </>
          ) : null}
        </View>
      </View>

      {busy ? <Text style={styles.busyText}>Subiendo sustento…</Text> : null}
    </View>
  );
}

TicketCard.propTypes = {
  ticket: PropTypes.shape({
    id: PropTypes.number.isRequired,
    fechaInasistencia: PropTypes.string,
    bloqueId: PropTypes.number,
    materiaNombre: PropTypes.string,
    horaInicio: PropTypes.string,
    horaFin: PropTypes.string,
    motivo: PropTypes.string,
    storagePath: PropTypes.string,
    estado: PropTypes.string,
    fechaResolucion: PropTypes.string,
    resueltoPorNombre: PropTypes.string,
    observacionesAdmin: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  busy: PropTypes.bool,
  viewing: PropTypes.bool,
  onViewSustento: PropTypes.func.isRequired,
  onAttach: PropTypes.func.isRequired,
};

export { MiniButton };

