import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { listarCursos, listarHorario } from '../api/catalogo';

// DOCENTE (CONTEXT §3.3): asistencia, calificaciones 0-20, recursos y
// comunicados — pendientes en backend. Consume lo real (/me + cursos si es
// ADMIN) y marca el resto como pendiente sin romper el diseño.
export default function ProfesorPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [cursos, setCursos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: 'home', iconOutline: 'home-outline' },
    { id: 'cursos', label: 'Cursos', icon: 'book', iconOutline: 'book-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  // useEffect: intenta cursos del docente; 403 esperado si no es ADMIN.
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const lista = await listarCursos();
        const mios = (lista || []).filter((c) => c.docenteId === user?.id || c.docente?.id === user?.id);
        if (vivo) setCursos(mios);
      } catch (e) {
        if (vivo) setError(e);
      } finally {
        if (vivo) setLoading(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [user?.id]);

  const nombre = displayName(user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                  <View>
                    <Text style={styles.studentName}>{nombre}</Text>
                    <Text style={styles.studentGrade}>Docente · {user?.email}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Activo</Text>
                </View>
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
            <Text style={styles.sectionSubtitle}>Docente × materia × sección (backend real)</Text>
            {loading ? (
              <LoadingView message="Consultando cursos..." />
            ) : error && error.status === 403 ? (
              <EmptyState
                icon="lock-closed-outline"
                title="Solo ADMIN lista cursos hoy"
                hint="El catálogo es exclusivo de ADMIN. Tus asignaciones se verán aquí cuando el backend exponga cursos por docente."
              />
            ) : error ? (
              <ErrorCard error={error} />
            ) : cursos && cursos.length > 0 ? (
              cursos.map((c) => (
                <View key={c.id} style={styles.courseCardPro}>
                  <Text style={styles.courseTitle}>{c.materiaNombre || `Curso #${c.id}`}</Text>
                  <Text style={styles.courseTeacherName}>Sección {c.seccionEtiqueta || c.seccionId}</Text>
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
                <Text style={styles.infoValueText}>{user?.email}</Text>
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
