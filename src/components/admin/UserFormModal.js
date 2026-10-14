import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { crearAdmin, crearDocente, crearSecretaria, actualizarUsuario } from '../../api/admin';

// Alta (ADMIN/DOCENTE/SECRETARIA) y edición. El rol no es editable:
// para cambiarlo se da de baja y se crea otra cuenta.
export default function UserFormModal({ visible, onClose, onSaved, editUser }) {
  const isEdit = !!editUser;
  const [rol, setRol] = useState('DOCENTE');
  const [form, setForm] = useState({
    email: '', password: 'Educa@360', nombres: '', apellidos: '',
    dni: '', telefonos: '', titulo: '', fechaNacimiento: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincroniza el formulario cada vez que se abre (crear limpio / editar con datos).
  useEffect(() => {
    if (!visible) return;
    if (editUser) {
      setForm({
        email: editUser.email, password: 'Educa@360', nombres: editUser.nombres,
        apellidos: editUser.apellidos, dni: editUser.dni,
        telefonos: (editUser.telefonos || []).join(', '),
        titulo: editUser.titulo || '', fechaNacimiento: editUser.fechaNacimiento || '',
      });
    } else {
      setForm({ email: '', password: 'Educa@360', nombres: '', apellidos: '', dni: '', telefonos: '', titulo: '', fechaNacimiento: '' });
      setRol('DOCENTE');
    }
    setError(null);
  }, [visible, editUser]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError(null);
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        const body = {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          telefonos: form.telefonos.trim()
            ? form.telefonos.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
          fechaNacimiento: form.fechaNacimiento.trim() || null,
          titulo: form.titulo.trim() || null,
        };
        await actualizarUsuario(editUser.id, body);
      } else {
        const usuario = {
          email: form.email.trim(), password: form.password,
          nombres: form.nombres.trim(), apellidos: form.apellidos.trim(), dni: form.dni.trim(),
        };
        const tels = form.telefonos.trim()
          ? form.telefonos.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined;
        if (tels) usuario.telefonos = tels;
        if (rol === 'ADMIN') await crearAdmin(usuario);
        else if (rol === 'DOCENTE') await crearDocente(usuario, { titulo: form.titulo.trim() || null });
        else await crearSecretaria(usuario, {});
      }
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title={isEdit ? `Editar ${editUser?.email}` : 'Nuevo personal'}
      onClose={onClose}
    >
      <View>
        {!isEdit && (
          <View style={styles.rolRow}>
            {['DOCENTE', 'SECRETARIA', 'ADMIN'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rolBtn, rol === r && styles.rolBtnActive]}
                onPress={() => setRol(r)}
              >
                <Text style={[styles.rolText, rol === r && styles.rolTextActive]}>
                  {r === 'DOCENTE' ? 'Docente' : r === 'SECRETARIA' ? 'Secretaría' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {!isEdit && (
          <>
            <Field label="Correo @educa360.pe" value={form.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" placeholder="nombre@educa360.pe" />
            <Field label="Clave inicial" value={form.password} onChangeText={(v) => set('password', v)} secureTextEntry />
            <Field label="DNI (8 dígitos)" value={form.dni} onChangeText={(v) => set('dni', v)} keyboardType="numeric" placeholder="12345678" />
          </>
        )}
        <Field label="Nombres" value={form.nombres} onChangeText={(v) => set('nombres', v)} placeholder="María" />
        <Field label="Apellidos" value={form.apellidos} onChangeText={(v) => set('apellidos', v)} placeholder="López" />
        <Field label="Teléfonos (separados por coma, vacío = quitar todos)" value={form.telefonos} onChangeText={(v) => set('telefonos', v)} placeholder="+51999888777" />
        {(!isEdit && rol === 'DOCENTE') || (isEdit && editUser?.rol === 'DOCENTE') ? (
          <Field label="Título (opcional)" value={form.titulo} onChangeText={(v) => set('titulo', v)} placeholder="Lic. Matemáticas" />
        ) : null}
        {isEdit && editUser?.rol === 'ESTUDIANTE' ? (
          <Field label="Fecha nacimiento (AAAA-MM-DD)" value={form.fechaNacimiento} onChangeText={(v) => set('fechaNacimiento', v)} placeholder="2011-08-22" />
        ) : null}
        {loading ? <LoadingView message="Guardando…" /> : null}
        {error ? <ErrorCard error={error} /> : null}
        <CosmicButton title={isEdit ? 'Guardar cambios' : 'Crear cuenta'} onPress={guardar} loading={loading} />
      </View>
    </FormModal>
  );
}

UserFormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  editUser: PropTypes.object,
};

const styles = StyleSheet.create({
  rolRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rolBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#F8FAFC',
  },
  rolBtnActive: { borderColor: '#5F348F', backgroundColor: '#F3E8FF' },
  rolText: { fontWeight: '700', color: '#64748B', fontSize: 13 },
  rolTextActive: { color: '#5F348F' },
});
