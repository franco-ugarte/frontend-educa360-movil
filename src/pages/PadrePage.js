import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import LoadingView from '../components/ui/LoadingView';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';

// Importación corregida de los datos relacionales
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { misHijos } from '../api/catalogo';

export default function PadrePage() {
  const { user: backendUser, signOut } = useAuth();
  const usuario = {
    personaId: backendUser?.id,
    id: backendUser?.id,
    nombre: displayName(backendUser),
    email: backendUser?.email,
    ...backendUser,
  };
  const [activeTab, setActiveTab] = useState('inicio');
  const [hijos, setHijos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const nombreUsuario = usuario?.nombre || 'Apoderado';

  // useEffect: representados formales del token (sección del periodo vigente).
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const lista = await misHijos();
        if (vivo) setHijos(lista || []);
      } catch {
        if (vivo) setHijos([]);
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
    { id: 'hijos', label: 'Hijos', icon: 'people', iconOutline: 'people-outline' },
    { id: 'reportes', label: 'Reportes', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  const lista = hijos || [];
  const pagados = lista.filter((h) => h.matriculaEstado === 'PAGADO').length;

  const hijoCard = (hijo, detalle) => (
    <View key={hijo.estudianteId} style={styles.courseCardPro}>
      <View style={styles.courseTopRow}>
        <View style={[styles.courseIconBox, { backgroundColor: '#F3E8FF' }]}>
          <Ionicons name="school" size={20} color="#5F348F" />
        </View>
        <View style={styles.courseMainInfo}>
          <Text style={styles.courseTitle}>{hijo.nombres} {hijo.apellidos}</Text>
          <Text style={styles.courseTeacherName}>
            {hijo.seccionEtiqueta
              ? `${hijo.seccionEtiqueta} · ${hijo.periodoNombre} · ${hijo.matriculaEstado}`
              : 'Sin matrícula vigente'}
          </Text>
        </View>
        <View style={styles.courseTag}>
          <Text style={styles.courseTagText}>{hijo.parentesco}</Text>
        </View>
      </View>
      {detalle ? (
        <View style={styles.courseMetaRow}>
          <View style={styles.courseMetaItem}>
            <Ionicons name="mail-outline" size={15} color="#64748B" />
            <Text style={styles.courseMetaText}>{hijo.email}</Text>
          </View>
          <View style={styles.courseMetaItem}>
            <Ionicons name="star-outline" size={15} color="#64748B" />
            <Text style={styles.courseMetaText}>
              {hijo.responsablePrincipal ? 'Principal' : 'Autorizado'}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5F348F" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabecera Superior */}
        <View style={styles.topBanner}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>Hola, {nombreUsuario.split(' ')[0]}!</Text>
              <Text style={styles.bannerSubtitle}>Portal y seguimiento académico del apoderado</Text>
            </View>
            <TouchableOpacity style={styles.bellIconButton} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'inicio' && (
          <>
            <View style={styles.mainCard}>
              <View style={styles.profileRow}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {nombreUsuario.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName} numberOfLines={2}>{nombreUsuario}</Text>
                    <Text style={styles.studentGrade}>Apoderado / Tutor Registrado</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: 10 }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Activo</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#5F348F' }]}>{cargando ? '–' : lista.length}</Text>
                  <Text style={styles.statLabel}>Hijos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>{cargando ? '–' : pagados}</Text>
                  <Text style={styles.statLabel}>Matriculados</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#F9B201' }]}>{cargando ? '–' : lista.length - pagados}</Text>
                  <Text style={styles.statLabel}>Pendientes</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accesos directos</Text>
              <View style={styles.grid}>
                <TouchableOpacity style={styles.moduleCard} activeOpacity={0.8} onPress={() => setActiveTab('hijos')}>
                  <View style={[styles.moduleIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="people-outline" size={20} color="#5F348F" />
                  </View>
                  <Text style={styles.moduleTitle}>Ver a mis hijos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.moduleCard} activeOpacity={0.8} onPress={() => setActiveTab('reportes')}>
                  <View style={[styles.moduleIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="stats-chart-outline" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.moduleTitle}>Reportes académicos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {activeTab === 'hijos' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis Hijos Registrados</Text>
            <Text style={styles.sectionSubtitle}>Estudiantes bajo su tutela institucional</Text>
            {cargando ? (
              <LoadingView message="Consultando tus hijos..." />
            ) : lista.length > 0 ? (
              lista.map((h) => hijoCard(h, true))
            ) : (
              <EmptyState
                title="Sin hijos vinculados"
                hint="Secretaría aún no te asigna representados. Acércate al colegio."
              />
            )}
          </View>
        )}

        {activeTab === 'reportes' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reportes por hijo</Text>
            <Text style={styles.sectionSubtitle}>Resumen académico del periodo vigente</Text>
            {cargando ? (
              <LoadingView message="Armando reportes..." />
            ) : lista.length > 0 ? (
              lista.map((h) => (
                <View key={h.estudianteId}>
                  {hijoCard(h, false)}
                  <View style={[styles.courseCardPro, { marginTop: -4 }]}>
                    <Text style={styles.progressTitle}>Rendimiento (0–20)</Text>
                    <EmptyState
                      icon="bar-chart-outline"
                      title="Notas pendientes en backend"
                      hint={`Las calificaciones de ${h.nombres} aparecerán aquí.`}
                    />
                    <Text style={[styles.progressTitle, { marginTop: 8 }]}>Asistencia</Text>
                    <EmptyState
                      icon="calendar-outline"
                      title="Registro pendiente en backend"
                      hint={`El control diario de ${h.nombres} aparecerá aquí.`}
                    />
                  </View>
                </View>
              ))
            ) : (
              <EmptyState title="Sin reportes" hint="Sin hijos vinculados no hay reportes." />
            )}
          </View>
        )}

        {activeTab === 'perfil' && (
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initialsOf(nombreUsuario)}</Text>
              </View>
              <Text style={styles.profileFullName}>{nombreUsuario}</Text>
              <View style={styles.profileRoleTag}>
                <Text style={styles.profileRoleText}>Apoderado Acreditado</Text>
              </View>
            </View>
            <View style={styles.infoListCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Correo</Text>
                </View>
                <Text style={styles.infoValueText}>{usuario?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="call-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Teléfono</Text>
                </View>
                <Text style={styles.infoValueText}>
                  {(usuario?.telefonos || []).join(', ') || 'Sin registrar'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="card-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>DNI</Text>
                </View>
                <Text style={styles.infoValueText}>{usuario?.dni || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="people-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Representados</Text>
                </View>
                <Text style={styles.infoValueText}>{lista.length}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Rol</Text>
                </View>
                <Text style={styles.infoValueText}>{usuario?.rol || 'APODERADO'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutProButton}
              activeOpacity={0.8}
              onPress={signOut}
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutProText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Dock Inferior Flotante */}
      <GradientButtonGroup
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />
    </View>
  );
}

PadrePage.propTypes = {};
