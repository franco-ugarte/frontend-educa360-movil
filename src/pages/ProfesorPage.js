import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { misCursos } from '../api/catalogo';

// DOCENTE (CONTEXT §3.3): asistencia, calificaciones 0-20, recursos y
// comunicados — pendientes en backend. Consume lo real (/me + cursos si es
// ADMIN) y marca el resto como pendiente sin romper el diseño.
export default function ProfesorPage() {
  const { user, perfil, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [cursos, setCursos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
    { id: 'cursos', label: 'Cursos', icon: 'book', iconOutline: 'book-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  // useEffect: SUS cursos del backend (GET /docente/cursos, zona DOCENTE).
  const recargar = async () => {
    setLoading(true);
    setError(null);
    try {
      setCursos((await misCursos()) || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nombre = displayName(user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} colors={['#5F348F']} onRefresh={() => { setRefreshing(true); recargar(); }} />
        }
      >
        <View style={styles.topBanner}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>Hola, {nombre.split(' ')[0]}!</Text>
              <Text style={styles.bannerSubtitle}>Portal del docente</Text>
            </View>
            <View style={styles.bellIconButton}>
              <Ionicons name="book-outline" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {activeTab === 'inicio' && (
          <>
            <View style={styles.mainCard}>
              <View style={styles.profileRow}>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initialsOf(nombre)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName} numberOfLines={2}>{nombre}</Text>
                    <Text style={styles.studentGrade}>Docente · {user?.email}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginTop: 10 }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Activo</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#5F348F' }]}>{cursos ? cursos.length : '–'}</Text>
                  <Text style={styles.statLabel}>Mis cursos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>20</Text>
                  <Text style={styles.statLabel}>Escala máx.</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#F9B201' }]}>0</Text>
                  <Text style={styles.statLabel}>Pendientes</Text>
                </View>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Módulos del docente</Text>
              <EmptyState
                icon="checkmark-done-outline"
                title="Asistencia y notas pendientes en backend"
                hint="El registro por sesión (PRESENTE/TARDANZA/FALTA/JUSTIFICADA) y calificaciones 0-20 aún no tienen endpoints."
              />
            </View>
          </>
        )}

        {activeTab === 'cursos' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis cursos asignados</Text>
            <Text style={styles.sectionSubtitle}>Docente × materia × sección</Text>
            {loading ? (
              <LoadingView message="Consultando tus cursos..." />
            ) : error ? (
              <ErrorCard error={error} />
            ) : cursos && cursos.length > 0 ? (
              cursos.map((c) => (
                <View key={c.id} style={styles.courseCardPro}>
                  <View style={styles.courseTopRow}>
                    <View style={[styles.courseIconBox, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="book" size={20} color="#5F348F" />
                    </View>
                    <View style={styles.courseMainInfo}>
                      <Text style={styles.courseTitle}>{c.materiaNombre}</Text>
                      <Text style={styles.courseTeacherName}>
                        {c.seccionEtiqueta} · {c.periodoNombre}
                      </Text>
                    </View>
                    <View style={styles.courseTag}>
                      <Text style={styles.courseTagText}>En Curso</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState title="Sin cursos asignados" hint="Aún no tienes cursos en el periodo vigente." />
            )}
          </View>
        )}

        {activeTab === 'perfil' && (
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initialsOf(nombre)}</Text>
              </View>
              <Text style={styles.profileFullName}>{nombre}</Text>
              <View style={styles.profileRoleTag}>
                <Text style={styles.profileRoleText}>Docente</Text>
              </View>
            </View>
            <View style={styles.infoListCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabelText}>Correo</Text>
                <Text style={[styles.infoValueText, { fontSize: 11.5 }]}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabelText}>Título</Text>
                <Text style={styles.infoValueText}>{perfil?.titulo || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabelText}>Habilitado en</Text>
                <Text style={styles.infoValueText}>
                  {(perfil?.materias || []).map((m) => m.nombre).join(', ') || '—'}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabelText}>DNI</Text>
                <Text style={styles.infoValueText}>{user?.dni}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutProButton} onPress={signOut} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              <Text style={styles.logoutProText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <GradientButtonGroup tabs={tabs} activeTab={activeTab} onSelectTab={setActiveTab} />
    </View>
  );
}
