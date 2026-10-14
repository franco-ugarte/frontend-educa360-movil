import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { cambiarActivo, resetPassword } from '../../api/admin';
import { initialsOf } from '../../api/mappers';

// Ficha del usuario: editar, baja lógica y reseteo de clave.
// La baja corta el acceso al instante; el reset NO invalida tokens emitidos.
export default function UserDetailModal({ visible, onClose, user, onEdit, onChanged }) {
  const [tab, setTab] = useState('info'); // info | clave
  const [nueva, setNueva] = useState('Educa@360');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const toggleActivo = async () => {
    setLoading(true);
    setError(null);
    try {
      await cambiarActivo(user.id, !user.activo);
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const guardarClave = async () => {
    if (nueva.length < 8) {
      setError({ status: 400, message: 'La clave debe tener al menos 8 caracteres.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword(user.id, nueva);
      Alert.alert('Listo', 'Clave restablecida. No invalida tokens ya emitidos.');
      setTab('info');
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal visible={visible} title={`${user.nombres} ${user.apellidos}`} onClose={onClose}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsOf(`${user.nombres} ${user.apellidos}`)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.meta}>{user.rol} · DNI {user.dni} · {user.activo ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.action, { borderColor: '#5F348F' }]} onPress={() => onEdit(user)}>
          <Ionicons name="pencil-outline" size={16} color="#5F348F" />
          <Text style={[styles.actionText, { color: '#5F348F' }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, { borderColor: user.activo ? '#FECACA' : '#A7F3D0' }]} onPress={toggleActivo}>
          <Ionicons name={user.activo ? 'ban-outline' : 'checkmark-circle-outline'} size={16} color={user.activo ? '#DC2626' : '#059669'} />
          <Text style={[styles.actionText, { color: user.activo ? '#DC2626' : '#059669' }]}>
            {user.activo ? 'Dar de baja' : 'Reactivar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, { borderColor: '#E2E8F0' }]} onPress={() => setTab(tab === 'clave' ? 'info' : 'clave')}>
          <Ionicons name="key-outline" size={16} color="#64748B" />
          <Text style={styles.actionText}>Clave</Text>
        </TouchableOpacity>
      </View>

      {tab === 'clave' && (
        <View style={{ marginTop: 8 }}>
          <Field label="Nueva clave (mín. 8)" value={nueva} onChangeText={setNueva} secureTextEntry />
          <CosmicButton title="Restablecer clave" onPress={guardarClave} loading={loading} />
        </View>
      )}

      {loading && tab === 'info' ? <LoadingView message="Aplicando…" /> : null}
      {error ? <ErrorCard error={error} /> : null}
    </FormModal>
  );
}

UserDetailModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#5F348F',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  email: { fontWeight: '800', color: '#1E1B4B', fontSize: 14 },
  meta: { color: '#64748B', fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, backgroundColor: '#F8FAFC',
  },
  actionText: { fontWeight: '700', fontSize: 12.5, color: '#64748B' },
});
