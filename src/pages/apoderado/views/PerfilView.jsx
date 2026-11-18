import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';
import { useAuth } from '../../../state/AuthContext';
import { useApoderadoData } from '../data';
import SectionTitle from '../../../components/ui/SectionTitle';
import PhoneEditor from '../../../components/domain/PhoneEditor';
import RecordatoriosCard from '../../../components/domain/RecordatoriosCard';
import { styles } from '../styles';
import { displayName } from '../../../api/mappers';
import { iniciales, parentescoLabel, situacionLabel } from '../../../utils/format';
import { colors } from '../../../theme';

const LOGO = require('../../../../assets/logo.png');

export default function PerfilView({ onNavigate }) {
  const { user, signOut } = useAuth();
  const { hijos, hijo, selectChild, horario, refreshing, refresh } = useApoderadoData();
  const [editPhones, setEditPhones] = useState(false);

  const nombre = displayName(user);
  const initials = iniciales(user?.nombres, user?.apellidos);

  const rows = [
    { icon: 'mail-outline', label: 'Correo', value: user?.email || '—' },
    {
      icon: 'call-outline',
      label: 'Teléfonos',
      value:
        Array.isArray(user?.telefonos) && user.telefonos.length
          ? user.telefonos.join(' · ')
          : 'Agregar',
      onPress: () => setEditPhones(true),
    },
    { icon: 'card-outline', label: 'DNI', value: user?.dni || '—' },
    {
      icon: 'shield-checkmark-outline',
      label: 'Cuenta',
      value: user?.activo === false ? 'Inactiva' : 'Activa',
    },
    { icon: 'people-outline', label: 'Hijos vinculados', value: String(hijos.length) },
  ];

  const abrirHijo = (hijoId) => {
    selectChild(hijoId);
    onNavigate('notas');
  };

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
      <View style={styles.profileHero}>
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarBigWrap}
        >
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>{initials}</Text>
          </View>
        </LinearGradient>
        <Text style={styles.profileFullName}>{nombre}</Text>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>Apoderado</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        {rows.map((row, index) => {
          const ultima = index === rows.length - 1;
          const contenido = (
            <>
              <View style={styles.infoLabelGroup}>
                <Ionicons name={row.icon} size={17} color={colors.muted} />
                <Text style={styles.infoLabel}>{row.label}</Text>
              </View>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {row.value}
                </Text>
                {row.onPress ? (
                  <Ionicons name="pencil" size={13} color={colors.primary} />
                ) : null}
              </View>
            </>
          );

          if (row.onPress) {
            return (
              <TouchableOpacity
                key={row.label}
                style={[styles.infoRow, ultima && styles.infoRowLast]}
                activeOpacity={0.8}
                onPress={row.onPress}
                accessibilityLabel={`Editar ${row.label}`}
              >
                {contenido}
              </TouchableOpacity>
            );
          }

          return (
            <View
              key={row.label}
              style={[styles.infoRow, ultima && styles.infoRowLast]}
            >
              {contenido}
            </View>
          );
        })}
      </View>

      <PhoneEditor
        visible={editPhones}
        telefonos={user?.telefonos || []}
        onClose={() => setEditPhones(false)}
        onSaved={() => setEditPhones(false)}
      />

      <RecordatoriosCard
        rol="APODERADO"
        horario={horario}
        nombre={hijo?.nombres}
        seccion={hijo?.seccionEtiqueta}
      />

      <View style={styles.section}>
        <SectionTitle
          title="Mis hijos"
          actionLabel={hijos.length ? 'Ver notas' : undefined}
          onAction={() => onNavigate('notas')}
        />
        <View style={styles.card}>
          {hijos.length === 0 ? (
            <Text
              style={[
                styles.infoValue,
                { textAlign: 'left', paddingVertical: 14, paddingHorizontal: 16 },
              ]}
            >
              Sin hijos vinculados. Contacta a Secretaría.
            </Text>
          ) : (
            hijos.map((item, index) => {
              const activo = item.estudianteId === hijo?.estudianteId;
              return (
                <TouchableOpacity
                  key={item.estudianteId}
                  style={[
                    styles.childRow,
                    index === hijos.length - 1 && styles.childRowLast,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => abrirHijo(item.estudianteId)}
                >
                  <View style={styles.childRowAvatar}>
                    <Text style={styles.childRowAvatarText}>
                      {iniciales(item.nombres, item.apellidos)}
                    </Text>
                  </View>
                  <View style={styles.childRowInfo}>
                    <Text style={styles.childRowName} numberOfLines={1}>
                      {item.nombres} {item.apellidos}
                    </Text>
                    <Text style={styles.childRowMeta} numberOfLines={1}>
                      {parentescoLabel(item.parentesco)}
                      {item.seccionEtiqueta
                        ? ` · ${item.seccionEtiqueta} · ${item.anioNombre}`
                        : ' · Sin matrícula vigente'}
                    </Text>
                  </View>
                  {item.responsablePrincipal ? (
                    <View style={styles.childRowBadge}>
                      <Text style={styles.childRowBadgeText}>Principal</Text>
                    </View>
                  ) : null}
                  <Ionicons
                    name={activo ? 'checkmark-circle' : 'chevron-forward'}
                    size={18}
                    color={activo ? colors.primary : colors.faint}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>

      {hijo?.situacionFinal ? (
        <Text style={styles.footNote}>
          {hijo.nombres} · {situacionLabel(hijo.situacionFinal)}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={signOut}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={styles.aboutCard}>
        <Image source={LOGO} style={styles.aboutLogo} resizeMode="contain" />
        <View style={styles.aboutTextBox}>
          <Text style={styles.aboutText}>Educa360 Móvil</Text>
          <Text style={styles.versionText}>
            Versión 1.0.0 · Colegio Nuestra Señora de Monserrat
          </Text>
        </View>
      </View>

      <Text style={styles.footNote}>
        La gestión administrativa, las descargas y la matrícula están en la versión
        web.
      </Text>
    </ScrollView>
  );
}

PerfilView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
