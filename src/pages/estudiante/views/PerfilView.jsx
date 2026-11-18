import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../state/AuthContext';
import { useStudentData } from '../data';
import RecordatoriosCard from '../../../components/domain/RecordatoriosCard';
import { styles } from '../styles';
import { displayName } from '../../../api/mappers';
import { iniciales, situacionLabel } from '../../../utils/format';
import { colors } from '../../../theme';

const LOGO = require('../../../../assets/logo.png');

export default function PerfilView() {
  const { user, perfil, signOut } = useAuth();
  const { matricula, cursos, horario, refreshing, refresh } = useStudentData();

  const nombre = displayName(user);
  const initials = iniciales(user?.nombres, user?.apellidos);
  const seccion = matricula
    ? `${matricula.seccionEtiqueta} · ${matricula.anioNombre}`
    : perfil?.seccionEtiqueta && perfil?.anioNombre
      ? `${perfil.seccionEtiqueta} · ${perfil.anioNombre}`
      : 'Sin matrícula vigente';

  const rows = [
    { icon: 'mail-outline', label: 'Correo', value: user?.email || '—' },
    {
      icon: 'call-outline',
      label: 'Teléfonos',
      value:
        Array.isArray(user?.telefonos) && user.telefonos.length
          ? user.telefonos.join(' · ')
          : 'Gestionados por tu apoderado',
    },
    { icon: 'card-outline', label: 'DNI', value: user?.dni || '—' },
    { icon: 'school-outline', label: 'Sección', value: seccion },
    { icon: 'ribbon-outline', label: 'Situación', value: matricula ? situacionLabel(matricula.situacionFinal) : '—' },
    { icon: 'book-outline', label: 'Cursos', value: String(cursos.length) },
  ];

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
          <Text style={styles.roleText}>Estudiante</Text>
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

      <RecordatoriosCard
        rol="ESTUDIANTE"
        horario={horario}
        cursos={cursos}
        nombre={user?.nombres}
        seccion={matricula?.seccionEtiqueta}
      />

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
        Tus contactos los gestiona tu apoderado. La gestión administrativa y las
        descargas están en la versión web.
      </Text>
    </ScrollView>
  );
}
