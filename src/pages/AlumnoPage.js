import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName } from '../api/mappers';
import { misCursosEstudiante } from '../api/catalogo';

export default function AlumnoPage() {
  const { user: backendUser, perfil, signOut } = useAuth();
  // Adaptador backend -> vista: el backend entrega {nombres,apellidos,email,rol};
  // los cursos salen de /estudiante/cursos (matrícula vigente); las notas
  // siguen locales porque calificaciones aún no existe en el backend.
  const usuario = {
    personaId: 101,
    nombre: displayName(backendUser),
    email: backendUser?.email,
    ...backendUser,
  };
  const setPage = () => {};
  // Pestañas: 'inicio' | 'cursos' | 'notas' | 'perfil'
  const [activeTab, setActiveTab] = useState('inicio');
  const [cursosReales, setCursosReales] = useState(null);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // useEffect: cursos de SU sección según matrícula vigente (puede ser vacía).
  const recargarCursos = async () => {
    setCargandoCursos(true);
    try {
      setCursosReales((await misCursosEstudiante()) || []);
    } catch {
      setCursosReales([]);
    } finally {
      setCargandoCursos(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    recargarCursos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ficha del alumno: identidad de la cuenta + sección/matrícula del perfil.
  // Promedio y asistencia aún no tienen endpoints: se muestran como '–'.
  const alumnoData = {
    id: backendUser?.id,
    nombre: displayName(backendUser),
    grado: perfil?.seccionEtiqueta || 'Sin matrícula',
    seccion: perfil?.periodoNombre || '',
    asistencia: '–',
    promedio: '–',
  };

  const initials = alumnoData.nombre
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // 4 pestañas requeridas
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
    { id: 'cursos', label: 'Cursos', icon: 'book', iconOutline: 'book-outline' },
    { id: 'notas', label: 'Notas', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* 2. Coloca el StatusBar translúcido aquí arriba */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} colors={['#5F348F']} onRefresh={() => { setRefreshing(true); recargarCursos(); }} />
        }
      >
        {/* Cabecera Morada Escolar */}
        <View style={styles.topBanner}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>
                Hola, {alumnoData.nombre.split(' ')[0]}!
              </Text>
              <Text style={styles.bannerSubtitle}>
                Panel académico del estudiante
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bellIconButton}
              onPress={() => setActiveTab('perfil')}
            >
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjeta del Estudiante (Presente en Inicio) */}
        {activeTab === 'inicio' && (
          <>
            <View style={styles.mainCard}>
              <View style={styles.profileRow}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName} numberOfLines={2}>{alumnoData.nombre}</Text>
                    <Text style={styles.studentGrade}>
                      {alumnoData.grado} - {alumnoData.seccion}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Etiqueta debajo del nombre para no tapar nombres largos */}
              <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: 10 }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Regular</Text>
              </View>

              {/* Métricas rápidas */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#5F348F' }]}>
                    {alumnoData.promedio}
                  </Text>
                  <Text style={styles.statLabel}>Promedio</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>
                    {alumnoData.asistencia}
                  </Text>
                  <Text style={styles.statLabel}>Asistencia</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#F9B201' }]}>
                    {cursosReales ? cursosReales.length : '–'}
                  </Text>
                  <Text style={styles.statLabel}>Cursos</Text>
                </View>
              </View>
            </View>

            {/* Módulos de Acceso Rápido */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Módulos Educativos</Text>
              <View style={styles.grid}>
                <TouchableOpacity
                  style={styles.moduleCard}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('cursos')}
                >
                  <View style={[styles.moduleIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="book-outline" size={20} color="#4F46E5" />
                  </View>
                  <Text style={styles.moduleTitle}>Materias y Horarios</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moduleCard}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert(
                    'Próximamente',
                    'El control de asistencia llegará con su módulo en el backend.'
                  )}
                >
                  <View style={[styles.moduleIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="calendar-outline" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.moduleTitle}>Control de Asistencia</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moduleCard}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('notas')}
                >
                  <View style={[styles.moduleIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="stats-chart-outline" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.moduleTitle}>Rendimiento y Notas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moduleCard}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('perfil')}
                >
                  <View style={[styles.moduleIconBox, { backgroundColor: '#FAF5FF' }]}>
                    <Ionicons name="person-circle-outline" size={20} color="#9333EA" />
                  </View>
                  <Text style={styles.moduleTitle}>Ficha del Alumno</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* PESTAÑA 2: CURSOS REALES (matrícula vigente) */}
        {activeTab === 'cursos' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Mis Cursos Matriculados</Text>
                <Text style={styles.sectionSubtitle}>
                  {perfil?.seccionEtiqueta
                    ? `${perfil.seccionEtiqueta} · ${perfil.periodoNombre} · Matrícula ${perfil.matriculaEstado}`
                    : 'Sin matrícula vigente'}
                </Text>
              </View>
            </View>

            {cargandoCursos ? (
              <LoadingView message="Consultando tus cursos..." />
            ) : cursosReales && cursosReales.length > 0 ? (
              cursosReales.map((item) => (
                <View key={item.id} style={styles.courseCardPro}>
                  <View style={styles.courseTopRow}>
                    <View style={[styles.courseIconBox, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="book" size={22} color="#5F348F" />
                    </View>
                    <View style={styles.courseMainInfo}>
                      <Text style={styles.courseTitle}>{item.materiaNombre}</Text>
                      <Text style={styles.courseTeacherName}>
                        Docente: {item.docenteNombre}
                      </Text>
                    </View>
                    <View style={styles.courseTag}>
                      <Text style={styles.courseTagText}>En Curso</Text>
                    </View>
                  </View>

                  <View style={styles.courseMetaRow}>
                    <View style={styles.courseMetaItem}>
                      <Ionicons name="people-outline" size={15} color="#64748B" />
                      <Text style={styles.courseMetaText}>{item.seccionEtiqueta}</Text>
                    </View>
                    <View style={styles.courseMetaItem}>
                      <Ionicons name="calendar-outline" size={15} color="#64748B" />
                      <Text style={styles.courseMetaText}>{item.periodoNombre}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                title="Sin cursos matriculados"
                hint="Aún no tienes matrícula en el periodo vigente. Acércate a Secretaría."
              />
            )}
          </View>
        )}

        {/* PESTAÑA 3: NOTAS (pendiente en backend: sin endpoint de calificaciones) */}
        {activeTab === 'notas' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Boleta de Calificaciones</Text>
                <Text style={styles.sectionSubtitle}>Escala vigesimal (0–20)</Text>
              </View>
            </View>
            <EmptyState
              title="Calificaciones pendientes en backend"
              hint="Tus notas 0–20 aparecerán aquí cuando el módulo exista."
            />
          </View>
        )}

        {/* PESTAÑA 4: PERFIL DEL ALUMNO + INFO + LOGOUT */}
        {activeTab === 'perfil' && (
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['#8C4ABD', '#F9B201']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarLargeWrap}
              >
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>{initials}</Text>
                </View>
              </LinearGradient>

              <Text style={styles.profileFullName}>{alumnoData.nombre}</Text>
              <View style={styles.profileRoleTag}>
                <Text style={styles.profileRoleText}>Estudiante Acreditado</Text>
              </View>
            </View>

            <View style={styles.infoListCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="card-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Código Estudiante</Text>
                </View>
                <Text style={styles.infoValueText}>ALU-{alumnoData.id || '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="school-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Sección vigente</Text>
                </View>
                <Text style={styles.infoValueText}>
                  {perfil?.seccionEtiqueta ? `${perfil.seccionEtiqueta} · ${perfil.periodoNombre}` : 'Sin matrícula'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="card-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Matrícula</Text>
                </View>
                <Text style={styles.infoValueText}>{perfil?.matriculaEstado || '—'}</Text>
              </View>

              <View style={{ paddingVertical: 11 }}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Correo</Text>
                </View>
                <Text style={[styles.infoValueText, { textAlign: 'left', marginTop: 4 }]}>
                  {usuario?.email || `${usuario?.usuario || 'alumno'}@educa360.pe`}
                </Text>
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

      {/* Dock Flotante Ancho (4 Botones) */}
      <GradientButtonGroup
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </View>
  );
}

AlumnoPage.propTypes = {};