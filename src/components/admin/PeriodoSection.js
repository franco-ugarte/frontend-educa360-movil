import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { styles } from '../../styles/Alumno.styles';
import { crearPeriodo, editarPeriodo, cambiarEstadoPeriodo } from '../../api/catalogo';

// Periodos: nacen CERRADOS y se abren a propósito; solo UNO abierto a la vez.
export default function PeriodoSection({ periodos, onChanged }) {
  const [modal, setModal] = useState(null); // null | {mode:'nuevo'} | {mode:'editar', item}
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abrir = (item) => {
    setForm(item ? { nombre: item.nombre, fechaInicio: item.fechaInicio, fechaFin: item.fechaFin } : { nombre: '', fechaInicio: '', fechaFin: '' });
    setError(null);
    setModal(item ? { mode: 'editar', item } : { mode: 'nuevo' });
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    try {
      if (modal.mode === 'nuevo') await crearPeriodo(form);
      else await editarPeriodo(modal.item.id, form);
      setModal(null);
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleEstado = async (item) => {
    setLoading(true);
    setError(null);
    try {
      await cambiarEstadoPeriodo(item.id, item.estado === 'ABIERTO' ? 'CERRADO' : 'ABIERTO');
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
        <Text style={styles.sectionTitle}>Periodos ({periodos.length})</Text>
        <TouchableOpacity style={own.add} onPress={() => abrir(null)}>
          <Text style={own.addText}>＋ Nuevo</Text>
        </TouchableOpacity>
      </View>
      {periodos.map((p) => (
        <View key={p.id} style={styles.gradeCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.gradeCourseTitle}>{p.nombre}</Text>
            <Text style={styles.gradePeriod}>{p.fechaInicio} → {p.fechaFin}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={styles.courseTag}>
              <Text style={styles.courseTagText}>{p.estado}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => abrir(p)}>
                <Text style={own.link}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleEstado(p)}>
                <Text style={own.link}>{p.estado === 'ABIERTO' ? 'Cerrar' : 'Abrir'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
      {error && !modal ? <ErrorCard error={error} /> : null}
      <FormModal visible={!!modal} title={modal?.mode === 'nuevo' ? 'Nuevo periodo' : 'Editar periodo'} onClose={() => setModal(null)}>
        <Field label="Nombre (único)" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} placeholder="Bimestre II 2026" />
        <Field label="Inicio (AAAA-MM-DD)" value={form.fechaInicio} onChangeText={(v) => setForm({ ...form, fechaInicio: v })} placeholder="2026-05-11" />
        <Field label="Fin (AAAA-MM-DD)" value={form.fechaFin} onChangeText={(v) => setForm({ ...form, fechaFin: v })} placeholder="2026-07-10" />
        {loading ? <LoadingView message="Guardando…" /> : null}
        {error ? <ErrorCard error={error} /> : null}
        <CosmicButton title="Guardar" onPress={guardar} loading={loading} />
      </FormModal>
    </View>
  );
}

PeriodoSection.propTypes = { periodos: PropTypes.array.isRequired, onChanged: PropTypes.func.isRequired };

const own = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  add: { backgroundColor: '#F3E8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  addText: { color: '#5F348F', fontWeight: '800', fontSize: 12.5 },
  link: { color: '#5F348F', fontWeight: '700', fontSize: 12.5 },
});
