import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar, // <-- 1. Asegúrate de importar StatusBar aquí
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import { styles } from '../styles/Alumno.styles';
import { alumnos } from '../data/alumnos';
import { cursos } from '../data/cursos';
import { profesores } from '../data/profesores';

export default function AlumnoPage({ usuario, setPage }) {
  // Pestañas: 'inicio' | 'cursos' | 'notas' | 'perfil'
  const [activeTab, setActiveTab] = useState('inicio');

  // Buscar información del alumno logueado
  const alumnoData = alumnos.find((a) => a.id === usuario?.personaId) || {
    id: 101,
    nombre: usuario?.nombre || usuario?.usuario || 'Juan Pérez',
    grado: '4to Grado B',
    seccion: 'Secundaria',
    asistencia: '94%',
    promedio: 15.8,
  };

  // Buscar docente asignado
  const getProfesorNombre = (profesorId) => {
    const profe = profesores.find((p) => p.id === profesorId);
    return profe ? profe.nombre : 'Docente Asignado';
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
                  <View>
                    <Text style={styles.studentName}>{alumnoData.nombre}</Text>
                    <Text style={styles.studentGrade}>
                      {alumnoData.grado} - {alumnoData.seccion}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Regular</Text>
                </View>
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
                    {cursos.length}
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

                <TouchableOpacity style={styles.moduleCard} activeOpacity={0.8}>
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

        {/* PESTAÑA 2: CURSOS CON DISEÑO PRO */}
        {activeTab === 'cursos' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Mis Cursos Matriculados</Text>
                <Text style={styles.sectionSubtitle}>
                  Periodo Escolar Vigente • {cursos.length} asignaturas
                </Text>
              </View>
            </View>

            {cursos.map((item, index) => {
              const progress = index === 0 ? 75 : 60;
              const iconName = item.nombre.toLowerCase().includes('mat') ? 'calculator' : 'flask';
              const iconColor = index === 0 ? '#5F348F' : '#0284C7';
              const iconBg = index === 0 ? '#F3E8FF' : '#E0F2FE';

              return (
                <View key={item.id} style={styles.courseCardPro}>
                  <View style={styles.courseTopRow}>
                    <View style={[styles.courseIconBox, { backgroundColor: iconBg }]}>
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </View>
                    <View style={styles.courseMainInfo}>
                      <Text style={styles.courseTitle}>{item.nombre}</Text>
                      <Text style={styles.courseTeacherName}>
                        Docente: {getProfesorNombre(item.profesorId)}
                      </Text>
                    </View>
                    <View style={styles.courseTag}>
                      <Text style={styles.courseTagText}>En Curso</Text>
                    </View>
                  </View>

                  <View style={styles.courseMetaRow}>
                    <View style={styles.courseMetaItem}>
                      <Ionicons name="time-outline" size={15} color="#64748B" />
                      <Text style={styles.courseMetaText}>
                        {index === 0 ? 'Lun - Mié 8:00 AM' : 'Mar - Jue 10:15 AM'}
                      </Text>
                    </View>
                    <View style={styles.courseMetaItem}>
                      <Ionicons name="business-outline" size={15} color="#64748B" />
                      <Text style={styles.courseMetaText}>Aula {201 + index}</Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressTitle}>Avance del Silabo</Text>
                      <Text style={styles.progressPercent}>{progress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* PESTAÑA 3: NOTAS / CALIFICACIONES */}
        {activeTab === 'notas' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Boleta de Calificaciones</Text>
                <Text style={styles.sectionSubtitle}>Bimestre II • Escala Vigesimal</Text>
              </View>
            </View>

            {cursos.map((item, index) => (
              <View key={item.id} style={styles.gradeCard}>
                <View>
                  <Text style={styles.gradeCourseTitle}>{item.nombre}</Text>
                  <Text style={styles.gradePeriod}>Evaluación Continua + Parcial</Text>
                </View>
                <View style={styles.gradeScoreBadge}>
                  <Text style={styles.gradeScoreValue}>{index === 0 ? '16.5' : '15.0'}</Text>
                </View>
              </View>
            ))}
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
                <Text style={styles.infoValueText}>ALU-{alumnoData.id || 101}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="school-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Grado y Sección</Text>
                </View>
                <Text style={styles.infoValueText}>
                  {alumnoData.grado} - {alumnoData.seccion}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="person-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Docente Tutor</Text>
                </View>
                <Text style={styles.infoValueText}>Prof. María López</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="people-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Apoderado</Text>
                </View>
                <Text style={styles.infoValueText}>Carlos Pérez</Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Correo Institucional</Text>
                </View>
                <Text style={styles.infoValueText}>
                  {usuario?.email || `${usuario?.usuario || 'alumno'}@educa360.pe`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutProButton}
              activeOpacity={0.8}
              onPress={() => setPage('login')}
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

AlumnoPage.propTypes = {
  usuario: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    rol: PropTypes.string.isRequired,
    personaId: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
  }).isRequired,
  setPage: PropTypes.func.isRequired,
};