import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';
import { useAuth } from '../../../state/AuthContext';
import { useDocenteData } from '../data';
import SectionTitle from '../../../components/ui/SectionTitle';
import PhoneEditor from '../../../components/domain/PhoneEditor';
import RecordatoriosCard from '../../../components/domain/RecordatoriosCard';
import { displayName } from '../../../api/mappers';
import { iniciales } from '../../../utils/format';
import { colors } from '../../../theme';
import { styles } from '../styles';

const LOGO = require('../../../../assets/logo.png');

export default function PerfilView({ onNavigate }) {
  const { user, perfil, signOut } = useAuth();
  const { cursos, totalAlumnos, horario, refreshing, refresh } = useDocenteData();
  const [editPhones, setEditPhones] = useState(false);

  const materias = perfil?.materias || [];
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
    { icon: 'ribbon-outline', label: 'Título', value: perfil?.titulo || '—' },
    { icon: 'book-outline', label: 'Cursos', value: String(cursos.length) },
    { icon: 'people-outline', label: 'Alumnos', value: String(totalAlumnos) },
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
        <Text style={styles.profileFullName}>{displayName(user)}</Text>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>Docente</Text>
        </View>
        {perfil?.titulo ? (
          <Text style={styles.profileTitle} numberOfLines={2}>
            {perfil.titulo}
          </Text>
        ) : null}
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
        rol="DOCENTE"
        horario={horario}
        cursos={cursos}
        nombre={user?.nombres}
      />

      <View style={styles.section}>
        <SectionTitle title="Materias habilitadas" />
        <View style={styles.card}>
          {materias.length === 0 ? (
            <Text style={styles.emptyText}>
              Aún no tienes materias habilitadas. Contacta a Administración.
            </Text>
          ) : (
            <View style={styles.subjectChips}>
              {materias.map((materia) => (
                <View key={materia.id} style={styles.subjectChip}>
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.subjectChipText}>{materia.nombre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Mis cursos"
          actionLabel={cursos.length ? 'Ver horario' : undefined}
          onAction={() => onNavigate('horario')}
        />
        <View style={styles.card}>
          {cursos.length === 0 ? (
            <Text style={styles.emptyText}>
              Sin cursos asignados por ahora.
            </Text>
          ) : (
            cursos.map((curso, index) => (
              <TouchableOpacity
                key={curso.id}
                style={[
                  styles.courseRow,
                  index === cursos.length - 1 && styles.courseRowLast,
                ]}
                activeOpacity={0.8}
                onPress={() => onNavigate('horario')}
              >
                <View style={styles.courseRowIcon}>
                  <Ionicons name="book-outline" size={16} color={colors.primary} />
                </View>
                <View style={styles.courseRowInfo}>
                  <Text style={styles.courseRowName} numberOfLines={1}>
                    {curso.materiaNombre}
                  </Text>
                  <Text style={styles.courseRowMeta} numberOfLines={1}>
                    {curso.seccionEtiqueta} · {curso.anioNombre} ·{' '}
                    {curso.cantidadAlumnos ?? 0} alumnos
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.faint}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.85}
        onPress={signOut}
      >
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
        La planificación, los materiales, las actas y la gestión administrativa
        están en la versión web.
      </Text>
    </ScrollView>
  );
}

PerfilView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
