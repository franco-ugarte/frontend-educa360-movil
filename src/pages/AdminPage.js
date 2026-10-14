import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { listarUsuarios } from '../api/admin';
import { listarPeriodos, listarMaterias, listarCursos } from '../api/catalogo';

// ADMIN (CONTEXT §3.1): personal, periodos/materias/secciones/cursos,
// reportes globales. No gestiona tickets (es de SECRETARIA).
export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [q, setQ] = useState('');
  const [usuarios, setUsuarios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [cursos, setCursos] = useState([]);

  const tabs = [
    { id: 'usuarios', label: 'Usuarios', icon: 'people', iconOutline: 'people-outline' },
    { id: 'catalogo', label: 'Catálogo', icon: 'grid', iconOutline: 'grid-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  // useEffect: carga panel ADMIN al montar (usuarios + catálogo).
  useEffect(() => {
    let vivo = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [u, p, m, c] = await Promise.all([
          listarUsuarios({}),
          listarPeriodos().catch(() => []),
          listarMaterias().catch(() => []),
          listarCursos().catch(() => []),
        ]);
        if (!vivo) return;
        setUsuarios(u);
        setPeriodos(p || []);
        setMaterias(m || []);
        setCursos(c || []);
      } catch (e) {
        if (vivo) setError(e);
      } finally {
        if (vivo) setLoading(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const filtrados = (usuarios || []).filter((u) => {
    if (!q.trim()) return true;
    const s = `${u.email} ${u.nombres} ${u.apellidos} ${u.dni}`.toLowerCase();
    return s.includes(q.trim().toLowerCase());
  });

  const counts = (usuarios || []).reduce((acc, u) => {
    acc[u.rol] = (acc[u.rol] || 0) + 1;
    return acc;
  }, {});

  const nombre = displayName(user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBanner}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>Hola, {nombre.split(' ')[0]}!</Text>
              <Text style={styles.bannerSubtitle}>Dirección · panel global</Text>
            </View>
            <View style={styles.bellIconButton}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {loading ? (
          <LoadingView message="Cargando panel ADMIN..." />
        ) : error ? (
          <View style={styles.section}><ErrorCard error={error} /></View>
        ) : activeTab === 'usuarios' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usuarios ({filtrados.length})</Text>
            <Text style={styles.sectionSubtitle}>
              {Object.entries(counts).map(([r, n]) => `${r}:${n}`).join(' · ') || 'Sin usuarios'}
            </Text>
            <View style={[styles.infoListCard, { marginTop: 10 }]}>
              <TextInput
                placeholder="Buscar por email, nombre o DNI"
                placeholderTextColor="#94A3B8"
                value={q}
                onChangeText={setQ}
                style={{ paddingVertical: 6 }}
                autoCapitalize="none"
              />
            </View>
            {filtrados.slice(0, 30).map((u) => (
              <View key={u.id} style={styles.courseCardPro}>
                <View style={styles.courseTopRow}>
                  <View style={[styles.courseIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={{ color: '#5F348F', fontWeight: '800' }}>{initialsOf(`${u.nombres} ${u.apellidos}`)}</Text>
                  </View>
                  <View style={styles.courseMainInfo}>
                    <Text style={styles.courseTitle}>{u.nombres} {u.apellidos}</Text>
                    <Text style={styles.courseTeacherName}>{u.email} · DNI {u.dni}</Text>
                  </View>
                  <View style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{u.rol}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : activeTab === 'catalogo' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catálogo académico</Text>
            <Text style={styles.sectionSubtitle}>Periodos · materias · cursos del backend real</Text>
            <View style={styles.mainCard}>
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#5F348F' }]}>{periodos.length}</Text>
                  <Text style={styles.statLabel}>Periodos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>{materias.length}</Text>
                  <Text style={styles.statLabel}>Materias</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: '#F9B201' }]}>{cursos.length}</Text>
                  <Text style={styles.statLabel}>Cursos</Text>
                </View>
              </View>
            </View>
            {(materias || []).slice(0, 10).map((m) => (
              <View key={m.id} style={styles.gradeCard}>
                <View>
                  <Text style={styles.gradeCourseTitle}>{m.nombre}</Text>
                  <Text style={styles.gradePeriod}>{m.activa ? 'Activa' : 'Archivada'}</Text>
                </View>
              </View>
            ))}
            {cursos.length === 0 ? (
              <EmptyState title="Sin cursos aún" hint="Crea periodos, secciones y cursos desde el panel web o Swagger." />
            ) : null}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initialsOf(nombre)}</Text>
              </View>
              <Text style={styles.profileFullName}>{nombre}</Text>
              <View style={styles.profileRoleTag}>
                <Text style={styles.profileRoleText}>Administrador</Text>
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
