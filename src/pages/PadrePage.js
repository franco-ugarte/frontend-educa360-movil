import React, { useState } from 'react';
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
import { styles } from '../styles/Alumno.styles';

// Importación corregida de los datos relacionales
import { relacionesFamilia } from '../data/relaciones';
import { alumnos } from '../data/alumnos';

export default function PadrePage({ usuario = {}, setPage = () => {} }) {
  const [activeTab, setActiveTab] = useState('inicio');

  // Validación segura para evitar que falle si personaId o id no están definidos
  const personaIdActual = usuario?.personaId || usuario?.id;
  const nombreUsuario = usuario?.nombre || 'Apoderado';

  // Lógica de filtrado usando relacionesFamilia
  const relaciones = (relacionesFamilia || []).filter(
    (relacion) => relacion.padreId === personaIdActual
  );

  const hijos = relaciones
    .map((relacion) =>
      (alumnos || []).find((alumno) => alumno.id === relacion.alumnoId)
    )
    .filter(Boolean);

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
    { id: 'hijos', label: 'Hijos', icon: 'people', iconOutline: 'people-outline' },
    { id: 'reportes', label: 'Reportes', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5F348F" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabecera Superior */}
        <View style={styles.topBanner}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>Hola, {nombreUsuario}!</Text>
              <Text style={styles.bannerSubtitle}>Portal y seguimiento académico del apoderado</Text>
            </View>
            <TouchableOpacity style={styles.bellIconButton} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjeta de Resumen */}
        <View style={styles.mainCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {nombreUsuario.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.studentName}>{nombreUsuario}</Text>
                <Text style={styles.studentGrade}>Apoderado / Tutor Registrado</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Sección de Hijos Vinculados */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Mis Hijos Registrados</Text>
              <Text style={styles.sectionSubtitle}>Estudiantes bajo su tutela institucional</Text>
            </View>
          </View>

          {hijos.length > 0 ? (
            hijos.map((hijo) => (
              <View key={hijo.id} style={styles.courseCardPro}>
                <View style={styles.courseTopRow}>
                  <View style={[styles.courseIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="school" size={20} color="#5F348F" />
                  </View>
                  <View style={styles.courseMainInfo}>
                    <Text style={styles.courseTitle}>{hijo.nombre}</Text>
                    <Text style={styles.courseTeacherName}>
                      {hijo.grado} - Sección {hijo.seccion}
                    </Text>
                  </View>
                  <View style={styles.courseTag}>
                    <Text style={styles.courseTagText}>Regular</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.courseCardPro, { alignItems: 'center', padding: 24 }]}>
              <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center' }}>
                No se encontraron hijos vinculados a este usuario en el sistema.
              </Text>
            </View>
          )}
        </View>

        {/* Botón de Cerrar Sesión si está en perfil */}
        {activeTab === 'perfil' && (
          <View style={[styles.section, { marginTop: 24 }]}>
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

      {/* Dock Inferior Flotante */}
      <GradientButtonGroup
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />
    </View>
  );
}

PadrePage.propTypes = {
  usuario: PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
    rol: PropTypes.string,
    personaId: PropTypes.number,
    nombre: PropTypes.string,
  }),
  setPage: PropTypes.func.isRequired,
};