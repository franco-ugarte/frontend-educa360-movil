import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import CosmicButton from '../components/ui/CosmicButton';
import FormModal from '../components/ui/FormModal';
import Field from '../components/ui/Field';
import PickerField from '../components/ui/PickerField';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  crearEstudiante, crearApoderado, listarEstudiantes, listarApoderados,
  vincularRepresentado, desvincularRepresentado, crearMatricula, cambiarEstadoMatricula,
} from '../api/secretaria';
import { listarSecciones } from '../api/catalogo';

const PARENTESCOS = ['PADRE', 'MADRE', 'TUTOR', 'HERMANO', 'OTRO'];

// SECRETARIA (CONTEXT §3.2 + Módulo 3): registro, alumnos + matrículas,
// familias + representados, tickets (pendiente) y perfil.
export default function SecretariaPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('registro');
  const [modo, setModo] = useState('estudiante'); // estudiante | apoderado
  const [form, setForm] = useState({ email: '', nombres: '', apellidos: '', dni: '', fechaNacimiento: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const [alumnos, setAlumnos] = useState(null);
  const [apoderados, setApoderados] = useState(null);
  const [secciones, setSecciones] = useState(null); // null = sin intentar; [] = sin permiso/vacío
  const [q, setQ] = useState('');
  const qDeb = useDebouncedValue(q.trim(), 400);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cargandoListas, setCargandoListas] = useState(true);

  const [matDe, setMatDe] = useState(null); // EstudianteResponse a matricular
  const [matSeccion, setMatSeccion] = useState(null);
  const [matSeccionId, setMatSeccionId] = useState('');
  const [recienMatriculada, setRecienMatriculada] = useState(null); // MatriculaResponse

  const [vincAbierto, setVincAbierto] = useState(false);
  const [vinc, setVinc] = useState({ apoderadoId: null, estudianteId: null, parentesco: 'PADRE', responsablePrincipal: true });

  const tabs = [
    { id: 'registro', label: 'Registro', icon: 'clipboard', iconOutline: 'clipboard-outline' },
    { id: 'alumnos', label: 'Alumnos', icon: 'school', iconOutline: 'school-outline' },
    { id: 'familias', label: 'Familias', icon: 'people', iconOutline: 'people-outline' },
    { id: 'tickets', label: 'Tickets', icon: 'ticket', iconOutline: 'ticket-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  // useEffect: listas de la zona (alumnos, familias; secciones solo si el rol puede).
  const recargarListas = async (qb = qDeb, eb = estadoFiltro) => {
    setCargandoListas(true);
    try {
      const [a, f, s] = await Promise.all([
        listarEstudiantes({ ...(qb ? { q: qb } : {}), ...(eb ? { estado: eb } : {}) }).catch(() => []),
        listarApoderados().catch(() => []),
        listarSecciones().catch(() => []),
      ]);
      setAlumnos(a || []);
      setApoderados(f || []);
      setSecciones(s || []);
    } finally {
      setCargandoListas(false);
      setRefreshing(false);
    }
  };

  // useEffect: recarga con búsqueda + estado (el hook evita spamear el API).
  useEffect(() => {
    let vivo = true;
    (async () => {
      if (vivo) await recargarListas();
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDeb, estadoFiltro]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError(null);
    setOkMsg(null);
  };

  // Correo autogenerado: nombres.apellidos en minúsculas con punto + dominio.
  // Sin tildes ni espacios ("Ana María Gómez Paz" → ana.maria.gomez.paz@educa360.pe).
  const emailAuto = (() => {
    const clean = (s) =>
      (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .join('.');
    const local = [clean(form.nombres), clean(form.apellidos)].filter(Boolean).join('.');
    return local ? `${local}@educa360.pe` : '';
  })();

  // DD-MM-AAAA (formulario) → AAAA-MM-DD (backend LocalDate).
  const fechaISO = (ddmmaaaa) => {
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec((ddmmaaaa || '').trim());
    return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    setOkMsg(null);
    try {
      if (!form.nombres.trim() || !form.apellidos.trim()) {
        throw { status: 400, message: 'Nombres y apellidos son obligatorios (generan el correo).' };
      }
      if (!form.dni.trim()) {
        throw { status: 400, message: 'El DNI es obligatorio.' };
      }
      if (modo === 'estudiante') {
        const iso = fechaISO(form.fechaNacimiento);
        if (!iso) throw { status: 400, message: 'La fecha debe tener formato DD-MM-AAAA (ej. 22-08-2011).' };
        const usuario = { email: emailAuto, password: 'Educa@360', nombres: form.nombres.trim(), apellidos: form.apellidos.trim(), dni: form.dni.trim() };
        await crearEstudiante(usuario, { fechaNacimiento: iso });
        setOkMsg(`Estudiante ${emailAuto} creado.`);
      } else {
        const usuario = { email: emailAuto, password: 'Educa@360', nombres: form.nombres.trim(), apellidos: form.apellidos.trim(), dni: form.dni.trim() };
        if (form.telefono.trim()) usuario.telefonos = [form.telefono.trim()];
        await crearApoderado(usuario, {});
        setOkMsg(`Apoderado ${emailAuto} creado.`);
      }
      setForm({ email: '', nombres: '', apellidos: '', dni: '', fechaNacimiento: '', telefono: '' });
      recargarListas();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const matricular = async () => {
    const seccionId = secciones && secciones.length > 0 ? matSeccion : parseInt(matSeccionId, 10);
    if (!matDe || !seccionId) {
      setError({ status: 400, message: 'Elige la sección (ID).' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const mat = await crearMatricula(matDe.id, seccionId);
      setRecienMatriculada(mat);
      recargarListas();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const pasarAPagado = async () => {
    if (!recienMatriculada) return;
    setLoading(true);
    try {
      await cambiarEstadoMatricula(recienMatriculada.id, 'PAGADO');
      setRecienMatriculada(null);
      setMatDe(null);
      recargarListas();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const vincular = async () => {
    if (!vinc.apoderadoId || !vinc.estudianteId) {
      setError({ status: 400, message: 'Elige apoderado y estudiante.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await vincularRepresentado(vinc.apoderadoId, {
        estudianteId: vinc.estudianteId,
        parentesco: vinc.parentesco,
        responsablePrincipal: vinc.responsablePrincipal,
      });
      setVincAbierto(false);
      recargarListas();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const desvincular = (apo, hijo) => {
    Alert.alert(
      'Desvincular',
      `${apo.nombres} dejará de ver a ${hijo.nombres}. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular', style: 'destructive',
          onPress: async () => {
            try {
              await desvincularRepresentado(apo.id, hijo.estudianteId || hijo.id);
              recargarListas();
            } catch (e) {
              Alert.alert('Error', e.message || 'No se pudo desvincular.');
            }
          },
        },
      ]
    );
  };

  const nombre = displayName(user);
  const inputStyle = [
    styles.infoValueText,
    { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 6, textAlign: 'left', opacity: 0.65 },
  ];
  const filtrados = alumnos || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} colors={['#5F348F']} onRefresh={() => { setRefreshing(true); recargarListas(); }} />
        }
      >
        <View style={styles.topBanner}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greetingText}>Hola, {nombre.split(' ')[0]}!</Text>
              <Text style={styles.bannerSubtitle}>Registro de alumnos y familias</Text>
            </View>
            <View style={styles.bellIconButton}>
              <Ionicons name="briefcase-outline" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {activeTab === 'registro' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Nuevo registro</Text>
              </View>
            </View>

            <View style={[styles.grid, { marginBottom: 12 }]}>
              {['estudiante', 'apoderado'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.moduleCard, modo === m && { borderColor: '#5F348F', borderWidth: 2 }]}
                  onPress={() => setModo(m)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moduleTitle}>{m === 'estudiante' ? 'Estudiante' : 'Apoderado'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoListCard}>
              {[
                ['nombres', 'Nombres', 'Ana María'],
                ['apellidos', 'Apellidos', 'Gómez Paz'],
                ['dni', 'DNI (8 dígitos)', '12345678'],
              ].map(([k, label, ph]) => (
                <View key={k}>
                  <Text style={styles.infoLabelText}>{label}</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder={ph}
                    value={form[k]}
                    onChangeText={(v) => set(k, v)}
                    autoCapitalize="none"
                  />
                </View>
              ))}
              <View>
                <Text style={styles.infoLabelText}>Correo autogenerado</Text>
                <Text style={[styles.infoValueText, { textAlign: 'left', opacity: 0.65, paddingVertical: 6 }]}>
                  {emailAuto || 'Escribe nombres y apellidos…'}
                </Text>
              </View>
              {modo === 'estudiante' ? (
                <View>
                  <Text style={styles.infoLabelText}>Fecha nacimiento (DD-MM-AAAA)</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="22-08-2011"
                    value={form.fechaNacimiento}
                    onChangeText={(v) => set('fechaNacimiento', v)}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.infoLabelText, { marginTop: 8 }]}>Sin teléfonos: el menor se contacta vía apoderado.</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.infoLabelText}>Teléfono (opcional, solo números)</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="999888777"
                    value={form.telefono}
                    onChangeText={(v) => set('telefono', v)}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {loading ? <LoadingView message="Guardando en el backend..." /> : null}
            {error ? <ErrorCard error={error} /> : null}
            {okMsg ? (
              <View style={[styles.courseCardPro, { borderColor: '#A7F3D0' }]}>
                <Text style={{ color: '#059669', fontWeight: '700' }}>{okMsg}</Text>
              </View>
            ) : null}

            <CosmicButton title="Guardar registro" onPress={guardar} loading={loading} />
            <TouchableOpacity
              style={[styles.logoutProButton, { marginTop: 12 }]}
              onPress={() => Alert.alert('Clave inicial', 'La clave inicial es Educa@360. El usuario la cambia luego.')}
            >
              <Text style={styles.logoutProText}>Clave inicial: Educa@360</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'alumnos' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alumnos ({filtrados.length})</Text>
            <Text style={styles.sectionSubtitle}>Ficha con sección, matrícula y apoderados</Text>
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {[null, 'ACTIVO', 'TRASLADADO', 'RETIRADO', 'EGRESADO'].map((e) => (
                <TouchableOpacity
                  key={e || 'TODOS'}
                  onPress={() => setEstadoFiltro(e)}
                  style={{
                    borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
                    borderColor: estadoFiltro === e ? '#5F348F' : '#E2E8F0',
                    backgroundColor: estadoFiltro === e ? '#F3E8FF' : '#FFFFFF',
                  }}
                >
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: estadoFiltro === e ? '#5F348F' : '#64748B' }}>
                    {e || 'TODOS'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {cargandoListas ? <LoadingView message="Cargando alumnos..." /> : null}
            {filtrados.map((a) => (
              <View key={a.id} style={styles.courseCardPro}>
                <View style={styles.courseTopRow}>
                  <View style={[styles.courseIconBox, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={{ color: '#5F348F', fontWeight: '800' }}>{initialsOf(`${a.nombres} ${a.apellidos}`)}</Text>
                  </View>
                  <View style={styles.courseMainInfo}>
                    <Text style={styles.courseTitle}>{a.nombres} {a.apellidos}</Text>
                    <Text style={styles.courseTeacherName}>{a.email} · {a.estado}</Text>
                  </View>
                  <View style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{a.matriculaEstado || 'SIN MATRÍCULA'}</Text>
                  </View>
                </View>
                <Text style={styles.courseTeacherName}>
                  {a.seccionEtiqueta ? `${a.seccionEtiqueta} · ${a.periodoNombre}` : 'Aún sin sección vigente'}
                  {(a.apoderados || []).length > 0
                    ? ` · ${(a.apoderados || []).map((v) => `${v.nombres} (${v.parentesco})`).join(', ')}`
                    : ' · sin apoderados'}
                </Text>
                {!a.seccionEtiqueta ? (
                  <TouchableOpacity onPress={() => { setMatDe(a); setRecienMatriculada(null); setError(null); }}>
                    <Text style={{ color: '#5F348F', fontWeight: '700', marginTop: 8 }}>Matricular →</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'familias' && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Familias ({(apoderados || []).length})</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#5F348F', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
                onPress={() => { setError(null); setVincAbierto(true); }}
              >
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>＋ Vincular</Text>
              </TouchableOpacity>
            </View>
            {cargandoListas ? <LoadingView message="Cargando familias..." /> : null}
            {(apoderados || []).map((apo) => (
              <View key={apo.id} style={styles.courseCardPro}>
                <Text style={styles.courseTitle}>{apo.nombres} {apo.apellidos}</Text>
                <Text style={styles.courseTeacherName}>{apo.email}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {(apo.hijos || []).map((h) => (
                    <View key={h.estudianteId} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E8FF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, gap: 4 }}>
                      <Text style={{ color: '#5F348F', fontWeight: '700', fontSize: 12 }}>
                        {h.nombres} ({h.parentesco}{h.responsablePrincipal ? ' ★' : ''})
                      </Text>
                      <TouchableOpacity onPress={() => desvincular(apo, h)}>
                        <Ionicons name="close-circle" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {(apo.hijos || []).length === 0 ? (
                    <Text style={styles.courseTeacherName}>Sin representados.</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'tickets' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tickets de justificación</Text>
            <EmptyState
              icon="ticket-outline"
              title="Módulo pendiente en backend"
              hint="Apoderado crea tickets y Secretaría aprueba/rechaza. Aún no hay endpoints: al aprobar, la asistencia pasará a JUSTIFICADA."
            />
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
                <Text style={styles.profileRoleText}>Secretaría</Text>
              </View>
            </View>
            <View style={styles.infoListCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabelText}>Correo</Text>
                <Text style={[styles.infoValueText, { fontSize: 11.5 }]}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabelText}>Teléfono</Text>
                <Text style={styles.infoValueText}>
                  {(user?.telefonos || []).join(', ') || 'Sin registrar'}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabelText}>Rol</Text>
                <Text style={styles.infoValueText}>{user?.rol}</Text>
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

      {/* Modal matricular: la matrícula nace PENDIENTE; el pase a PAGADO es explícito. */}
      <FormModal visible={!!matDe} title={`Matricular a ${matDe?.nombres}`} onClose={() => { setMatDe(null); setRecienMatriculada(null); }}>
        {secciones && secciones.length > 0 ? (
          <PickerField
            label="Sección del periodo vigente"
            value={matSeccion}
            options={secciones.map((s) => ({ label: `${s.etiqueta} · ${s.periodoNombre} (id ${s.id})`, value: s.id }))}
            onSelect={setMatSeccion}
          />
        ) : (
          <Field label="ID de sección (tu rol no lista secciones: 1 = 4°A, 2 = 4°B)" value={matSeccionId} onChangeText={setMatSeccionId} keyboardType="numeric" />
        )}
        {error ? <ErrorCard error={error} /> : null}
        {recienMatriculada ? (
          <View style={[styles.courseCardPro, { borderColor: '#A7F3D0' }]}>
            <Text style={{ color: '#059669', fontWeight: '700' }}>
              Matrícula #{recienMatriculada.id} PENDIENTE en {recienMatriculada.seccionEtiqueta}.
            </Text>
            <TouchableOpacity onPress={pasarAPagado} style={{ marginTop: 8 }}>
              <Text style={{ color: '#5F348F', fontWeight: '800' }}>Pasar a PAGADO →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CosmicButton title="Inscribir (nace PENDIENTE)" onPress={matricular} loading={loading} />
        )}
      </FormModal>

      {/* Modal vincular representado. */}
      <FormModal visible={vincAbierto} title="Vincular representado" onClose={() => setVincAbierto(false)}>
        <PickerField
          label="Apoderado"
          value={vinc.apoderadoId}
          options={(apoderados || []).map((a) => ({ label: `${a.nombres} ${a.apellidos}`, value: a.id }))}
          onSelect={(v) => setVinc({ ...vinc, apoderadoId: v })}
        />
        <PickerField
          label="Estudiante"
          value={vinc.estudianteId}
          options={(alumnos || []).map((a) => ({ label: `${a.nombres} ${a.apellidos}`, value: a.id }))}
          onSelect={(v) => setVinc({ ...vinc, estudianteId: v })}
        />
        <PickerField
          label="Parentesco"
          value={vinc.parentesco}
          options={PARENTESCOS.map((p) => ({ label: p, value: p }))}
          onSelect={(v) => setVinc({ ...vinc, parentesco: v })}
        />
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}
          onPress={() => setVinc({ ...vinc, responsablePrincipal: !vinc.responsablePrincipal })}
        >
          <Ionicons
            name={vinc.responsablePrincipal ? 'checkbox' : 'square-outline'}
            size={22} color="#5F348F"
          />
          <Text style={{ color: '#334155', fontWeight: '600' }}>Responsable principal (solo uno por alumno)</Text>
        </TouchableOpacity>
        {error ? <ErrorCard error={error} /> : null}
        <CosmicButton title="Vincular" onPress={vincular} loading={loading} />
      </FormModal>
    </View>
  );
}

SecretariaPage.propTypes = {};
