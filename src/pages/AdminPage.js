import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { listarUsuarios } from '../api/admin';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { listarPeriodos, listarMaterias, listarSecciones, listarCursos, listarDocentes } from '../api/catalogo';
import UserFormModal from '../components/admin/UserFormModal';
import UserDetailModal from '../components/admin/UserDetailModal';
import PeriodoSection from '../components/admin/PeriodoSection';
import MateriaSection from '../components/admin/MateriaSection';
import SeccionSection from '../components/admin/SeccionSection';
import HabilitacionesSection from '../components/admin/HabilitacionesSection';
import CursoSection from '../components/admin/CursoSection';

// ADMIN (CONTEXT §3.1): personal, periodos/materias/secciones/cursos,
// reportes globales. No gestiona tickets (es de SECRETARIA).
export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [q, setQ] = useState('');
  const qDeb = useDebouncedValue(q.trim(), 400);
  const [rolFiltro, setRolFiltro] = useState(null);
  const [activoFiltro, setActivoFiltro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarios, setUsuarios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formModal, setFormModal] = useState(null); // null | {mode:'nuevo'} | {mode:'editar', user}
  const [detailUser, setDetailUser] = useState(null);
  const recargar = () => setRefreshKey((k) => k + 1);

  const tabs = [
    { id: 'usuarios', label: 'Usuarios', icon: 'people', iconOutline: 'people-outline' },
    { id: 'catalogo', label: 'Catálogo', icon: 'grid', iconOutline: 'grid-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  // useEffect: carga panel ADMIN al montar, tras mutaciones y al filtrar.
  useEffect(() => {
    let vivo = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [u, p, m, s, d, c] = await Promise.all([
          listarUsuarios({
            ...(rolFiltro ? { rol: rolFiltro } : {}),
            ...(activoFiltro !== null ? { activo: activoFiltro } : {}),
            ...(qDeb ? { q: qDeb } : {}),
          }),
          listarPeriodos().catch(() => []),
          listarMaterias().catch(() => []),
          listarSecciones().catch(() => []),
          listarDocentes().catch(() => []),
          listarCursos().catch(() => []),
        ]);
        if (!vivo) return;
        setUsuarios(u);
        setPeriodos(p || []);
        setMaterias(m || []);
        setSecciones(s || []);
        setDocentes(d || []);
        setCursos(c || []);
      } catch (e) {
        if (vivo) setError(e);
      } finally {
        if (vivo) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => {
      vivo = false;
    };
  }, [refreshKey, rolFiltro, activoFiltro, qDeb]);

  const filtrados = usuarios || [];

  const nombre = displayName(user);

  const encabezado = (
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
  );

  const refresco = (
    <RefreshControl refreshing={refreshing} colors={['#5F348F']} onRefresh={() => { setRefreshing(true); recargar(); }} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refresco}
      >
        {encabezado}

        {loading ? (
          <LoadingView message="Cargando panel ADMIN..." />
        ) : error ? (
          <View style={styles.section}><ErrorCard error={error} /></View>
        ) : activeTab === 'usuarios' ? (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.sectionTitle}>Usuarios ({filtrados.length})</Text>
              </View>
              <TouchableOpacity
                style={{ backgroundColor: '#5F348F', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
                onPress={() => setFormModal({ mode: 'nuevo' })}
                activeOpacity={0.85}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>＋ Nuevo</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.infoListCard, { marginTop: 10 }]}>
              <TextInput
                placeholder="Buscar por email, nombre o DNI"
                placeholderTextColor="#94A3B8"
                value={q}
                onChangeText={setQ}
                style={{ paddingVertical: 6 }}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {[null, 'ADMIN', 'SECRETARIA', 'DOCENTE', 'ESTUDIANTE', 'APODERADO'].map((r) => (
                <TouchableOpacity
                  key={r || 'TODOS'}
                  onPress={() => setRolFiltro(r)}
                  style={{
                    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
                    borderColor: rolFiltro === r ? '#5F348F' : '#E2E8F0',
                    backgroundColor: rolFiltro === r ? '#F3E8FF' : '#FFFFFF',
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: rolFiltro === r ? '#5F348F' : '#64748B' }}>
                    {r || 'TODOS'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
              {[{ l: 'Todos', v: null }, { l: 'Activos', v: true }, { l: 'Inactivos', v: false }].map((o) => (
                <TouchableOpacity
                  key={o.l}
                  onPress={() => setActivoFiltro(o.v)}
                  style={{
                    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
                    borderColor: activoFiltro === o.v ? '#5F348F' : '#E2E8F0',
                    backgroundColor: activoFiltro === o.v ? '#F3E8FF' : '#FFFFFF',
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: activoFiltro === o.v ? '#5F348F' : '#64748B' }}>
                    {o.l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.sectionSubtitle, { marginBottom: 6 }]}>Toca una ficha para editar, dar de baja o resetear clave.</Text>
            {/* FlatList: lista virtualizada de fichas (rúbrica UI). */}
            <FlatList
              data={filtrados}
              keyExtractor={(u) => String(u.id)}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.sectionSubtitle, { textAlign: 'center', marginTop: 12 }]}>
                  Sin usuarios para este filtro.
                </Text>
              }
              renderItem={({ item: u }) => (
                <TouchableOpacity onPress={() => setDetailUser(u)} activeOpacity={0.85}>
                  <View style={styles.courseCardPro}>
                    <View style={styles.courseTopRow}>
                      <View style={[styles.courseIconBox, { backgroundColor: u.activo ? '#F3E8FF' : '#F1F5F9' }]}>
                        <Text style={{ color: u.activo ? '#5F348F' : '#94A3B8', fontWeight: '800' }}>{initialsOf(`${u.nombres} ${u.apellidos}`)}</Text>
                      </View>
                      <View style={styles.courseMainInfo}>
                        <Text style={styles.courseTitle}>{u.nombres} {u.apellidos}{u.activo ? '' : ' (inactivo)'}</Text>
                        <Text style={styles.courseTeacherName}>{u.email} · DNI {u.dni}</Text>
                      </View>
                      <View style={styles.courseTag}>
                        <Text style={styles.courseTagText}>{u.rol}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <UserFormModal
              visible={!!formModal}
              editUser={formModal?.mode === 'editar' ? formModal.user : null}
              onClose={() => setFormModal(null)}
              onSaved={() => { setFormModal(null); recargar(); }}
            />
            <UserDetailModal
              visible={!!detailUser}
              user={detailUser}
              onClose={() => setDetailUser(null)}
              onEdit={(u) => { setDetailUser(null); setFormModal({ mode: 'editar', user: u }); }}
              onChanged={() => { setDetailUser(null); recargar(); }}
            />
          </View>
        ) : activeTab === 'catalogo' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catálogo académico</Text>
            <Text style={styles.sectionSubtitle}>Periodos · materias · cursos</Text>
            {/* marginTop positivo: mainCard trae -15 para solaparse al banner,
                aquí taparía el subtítulo. */}
            <View style={[styles.mainCard, { marginTop: 10 }]}>
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
            <PeriodoSection periodos={periodos} onChanged={recargar} />
            <MateriaSection materias={materias} onChanged={recargar} />
            <SeccionSection secciones={secciones} periodos={periodos} docentes={docentes} cursos={cursos} onChanged={recargar} />
            <HabilitacionesSection docentes={docentes} materias={materias} onChanged={recargar} />
            <CursoSection cursos={cursos} docentes={docentes} materias={materias} secciones={secciones} onChanged={recargar} />
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
            <View style={styles.infoListCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Correo</Text>
                </View>
                <Text style={[styles.infoValueText, { fontSize: 11.5 }]}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="call-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>Teléfono</Text>
                </View>
                <Text style={styles.infoValueText}>
                  {(user?.telefonos || []).join(', ') || 'Sin registrar'}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.infoLabelGroup}>
                  <Ionicons name="card-outline" size={18} color="#64748B" />
                  <Text style={styles.infoLabelText}>DNI</Text>
                </View>
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
