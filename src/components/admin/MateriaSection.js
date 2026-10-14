import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { styles } from '../../styles/Alumno.styles';
import { crearMateria, editarMateria, setMateriaActiva } from '../../api/catalogo';

// Materias del catálogo: archivar (activa=false) frena NUEVOS cursos,
// los existentes se conservan — no es un borrado.
export default function MateriaSection({ materias, onChanged }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abrir = (item) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '' } : { nombre: '', descripcion: '' });
    setError(null);
    setModal(item ? { mode: 'editar', item } : { mode: 'nuevo' });
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    try {
      if (modal.mode === 'nuevo') await crearMateria(form);
      else await editarMateria(modal.item.id, form);
      setModal(null);
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiva = async (item) => {
    setLoading(true);
    setError(null);
    try {
      await setMateriaActiva(item.id, !item.activa);
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={own.head}>
        <Text style={styles.sectionTitle}>Materias ({materias.length})</Text>
        <TouchableOpacity style={own.add} onPress={() => abrir(null)}>
          <Text style={own.addText}>＋ Nueva</Text>
        </TouchableOpacity>
      </View>
      {materias.map((m) => (
        <View key={m.id} style={styles.gradeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.gradeCourseTitle}>{m.nombre}</Text>
            <Text style={styles.gradePeriod}>{m.activa ? 'Activa' : 'Archivada'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => abrir(m)}>
              <Text style={own.link}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleActiva(m)}>
              <Text style={own.link}>{m.activa ? 'Archivar' : 'Reactivar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {error && !modal ? <ErrorCard error={error} /> : null}
      <FormModal visible={!!modal} title={modal?.mode === 'nuevo' ? 'Nueva materia' : 'Editar materia'} onClose={() => setModal(null)}>
        <Field label="Nombre (único)" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} placeholder="Historia" />
        <Field label="Descripción" value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} placeholder="…" />
        {loading ? <LoadingView message="Guardando…" /> : null}
        {error ? <ErrorCard error={error} /> : null}
        <CosmicButton title="Guardar" onPress={guardar} loading={loading} />
      </FormModal>
    </View>
  );
}

MateriaSection.propTypes = { materias: PropTypes.array.isRequired, onChanged: PropTypes.func.isRequired };

const own = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  add: { backgroundColor: '#F3E8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  addText: { color: '#5F348F', fontWeight: '800', fontSize: 12.5 },
  link: { color: '#5F348F', fontWeight: '700', fontSize: 12.5 },
});
