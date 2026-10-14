import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import GradientButtonGroup from '../components/ui/GradientButtonGroup';
import CosmicButton from '../components/ui/CosmicButton';
import LoadingView from '../components/ui/LoadingView';
import ErrorCard from '../components/ui/ErrorCard';
import EmptyState from '../components/ui/EmptyState';
import { styles } from '../styles/Alumno.styles';
import { useAuth } from '../state/AuthContext';
import { displayName, initialsOf } from '../api/mappers';
import { crearEstudiante, crearApoderado } from '../api/secretaria';

// SECRETARIA (CONTEXT §3.2): registro de estudiantes y apoderados,
// tickets y matrículas pendientes en backend -> EmptyState honesto.
export default function SecretariaPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('registro');
  const [modo, setModo] = useState('estudiante'); // estudiante | apoderado
  const [form, setForm] = useState({ email: '', nombres: '', apellidos: '', dni: '', fechaNacimiento: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);

  const tabs = [
    { id: 'registro', label: 'Registro', icon: 'clipboard', iconOutline: 'clipboard-outline' },
    { id: 'tickets', label: 'Tickets', icon: 'ticket', iconOutline: 'ticket-outline' },
    { id: 'perfil', label: 'Perfil', icon: 'person', iconOutline: 'person-outline' },
  ];

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError(null);
    setOkMsg(null);
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    setOkMsg(null);
    try {
      if (modo === 'estudiante') {
        if (!form.fechaNacimiento) throw { status: 400, message: 'La fecha de nacimiento es obligatoria (AAAA-MM-DD).' };
        const usuario = { email: form.email, password: 'Educa@360', nombres: form.nombres, apellidos: form.apellidos, dni: form.dni };
        await crearEstudiante(usuario, { fechaNacimiento: form.fechaNacimiento });
        setOkMsg(`Estudiante ${form.email} creado.`);
      } else {
        const usuario = { email: form.email, password: 'Educa@360', nombres: form.nombres, apellidos: form.apellidos, dni: form.dni };
        if (form.telefono) usuario.telefonos = [form.telefono];
        await crearApoderado(usuario, {});
        setOkMsg(`Apoderado ${form.email} creado.`);
      }
      setForm({ email: '', nombres: '', apellidos: '', dni: '', fechaNacimiento: '', telefono: '' });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const nombre = displayName(user);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.sectionSubtitle}>SECRETARIA · alta en el backend real</Text>
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
                ['email', 'Correo @educa360.pe', 'ana@educa360.pe', false],
                ['nombres', 'Nombres', 'Ana', false],
                ['apellidos', 'Apellidos', 'Gómez', false],
                ['dni', 'DNI (8 dígitos)', '12345678', false],
              ].map(([k, label, ph]) => (
                <View key={k}>
                  <Text style={styles.infoLabelText}>{label}</Text>
                  <TextInput
                    style={[styles.infoValueText, { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 6 }]}
                    placeholder={ph}
                    value={form[k]}
                    onChangeText={(v) => set(k, v)}
                    autoCapitalize="none"
                  />
                </View>
              ))}
              {modo === 'estudiante' ? (
                <View>
                  <Text style={styles.infoLabelText}>Fecha nacimiento (AAAA-MM-DD)</Text>
                  <TextInput
                    style={[styles.infoValueText, { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 6 }]}
                    placeholder="2011-08-22"
                    value={form.fechaNacimiento}
                    onChangeText={(v) => set('fechaNacimiento', v)}
                  />
                  <Text style={[styles.infoLabelText, { marginTop: 8 }]}>Sin teléfonos: el menor se contacta vía apoderado.</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.infoLabelText}>Teléfono (opcional)</Text>
                  <TextInput
                    style={[styles.infoValueText, { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 6 }]}
                    placeholder="+51999888777"
                    value={form.telefono}
                    onChangeText={(v) => set('telefono', v)}
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
                <Text style={styles.infoValueText}>{user?.email}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabelText}>Rol backend</Text>
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
    </View>
  );
}

SecretariaPage.propTypes = {};
