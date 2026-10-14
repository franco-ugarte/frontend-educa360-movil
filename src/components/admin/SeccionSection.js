import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import PickerField from '../ui/PickerField';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { styles } from '../../styles/Alumno.styles';
import { crearSeccion, editarSeccion } from '../../api/catalogo';

// Secciones: grado 1..5, letra mayúscula, únicas por periodo.
// NO se mueven de periodo: se crea otra fila (histórico por periodo).
export default function SeccionSection({ secciones, periodos, docentes, cursos, onChanged }) {
  const [modal, setModal] = useState(null);
  const [expandida, setExpandida] = useState(null); // id de sección con cursos visibles
  const [form, setForm] = useState({ grado: '4', letra: '', aula: '', tutorId: null, periodoId: null });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abrir = (item) => {
    setForm(item
      ? { grado: String(item.grado), letra: item.letra, aula: item.aula || '', tutorId: item.tutorId, periodoId: item.periodoId }
      : { grado: '4', letra: '', aula: '', tutorId: null, periodoId: periodos[0]?.id || null });
    setError(null);
    setModal(item ? { mode: 'editar', item } : { mode: 'nuevo' });
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        grado: parseInt(form.grado, 10),
        letra: form.letra.trim().toUpperCase(),
        aula: form.aula.trim() || null,
        tutorId: form.tutorId,
        periodoId: modal.mode === 'nuevo' ? form.periodoId : modal.item.periodoId,
      };
      if (!body.grado || body.grado < 1 || body.grado > 5) throw { status: 400, message: 'El grado va de 1 a 5.' };
      if (!/^[A-Z]$/.test(body.letra)) throw { status: 400, message: 'La letra debe ser una mayúscula (A-Z).' };
      if (modal.mode === 'nuevo') await crearSeccion(body);
      else await editarSeccion(modal.item.id, body);
      setModal(null);
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const periodoOpts = periodos.map((p) => ({ label: `${p.nombre} (${p.estado})`, value: p.id }));
  const tutorOpts = [
    { label: 'Sin tutor', value: null },
    ...docentes.map((d) => ({ label: `${d.nombres} ${d.apellidos}`, value: d.id })),
  ];

  return (
    <View>
      <View style={own.head}>
        <Text style={styles.sectionTitle}>Secciones ({secciones.length})</Text>
        <TouchableOpacity style={own.add} onPress={() => abrir(null)}>
          <Text style={own.addText}>＋ Nueva</Text>
        </TouchableOpacity>
      </View>
      {secciones.map((s) => {
        const deLaSeccion = (cursos || []).filter((c) => c.seccionId === s.id);
        return (
          <View key={s.id} style={[styles.gradeCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View>
              <Text style={styles.gradeCourseTitle}>{s.etiqueta} · Aula {s.aula || '—'}</Text>
              <Text style={styles.gradePeriod}>{s.periodoNombre} · Tutor: {s.tutorNombre || 'sin asignar'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
              <TouchableOpacity onPress={() => abrir(s)}>
                <Text style={own.link}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setExpandida(expandida === s.id ? null : s.id)}>
                <Text style={own.link}>
                  {expandida === s.id ? 'Ocultar cursos' : `Ver cursos (${deLaSeccion.length})`}
                </Text>
              </TouchableOpacity>
            </View>
            {expandida === s.id ? (
              deLaSeccion.length > 0 ? (
                <View style={{ marginTop: 8, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, gap: 2 }}>
                  {deLaSeccion.map((c) => (
                    <Text key={c.id} style={styles.courseMetaText}>
                      • {c.materiaNombre} — {c.docenteNombre}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={[styles.courseMetaText, { marginTop: 8 }]}>Sin cursos en esta sección.</Text>
              )
            ) : null}
          </View>
        );
      })}
      {error && !modal ? <ErrorCard error={error} /> : null}
      <FormModal visible={!!modal} title={modal?.mode === 'nuevo' ? 'Nueva sección' : `Editar ${modal?.item.etiqueta}`} onClose={() => setModal(null)}>
        <Field label="Grado (1-5)" value={form.grado} onChangeText={(v) => setForm({ ...form, grado: v })} keyboardType="numeric" />
        <Field label="Letra (A-Z)" value={form.letra} onChangeText={(v) => setForm({ ...form, letra: v })} autoCapitalize="characters" />
        <Field label="Aula (texto libre)" value={form.aula} onChangeText={(v) => setForm({ ...form, aula: v })} placeholder="A-203" />
        {modal?.mode === 'nuevo'
          ? <PickerField label="Periodo" value={form.periodoId} options={periodoOpts} onSelect={(v) => setForm({ ...form, periodoId: v })} />
          : <Text style={own.note}>El periodo no se cambia: crea otra sección.</Text>}
        <PickerField label="Tutor" value={form.tutorId} options={tutorOpts} onSelect={(v) => setForm({ ...form, tutorId: v })} />
        {loading ? <LoadingView message="Guardando…" /> : null}
        {error ? <ErrorCard error={error} /> : null}
        <CosmicButton title="Guardar" onPress={guardar} loading={loading} />
      </FormModal>
    </View>
  );
}

SeccionSection.propTypes = {
  secciones: PropTypes.array.isRequired,
  periodos: PropTypes.array.isRequired,
  docentes: PropTypes.array.isRequired,
  cursos: PropTypes.array.isRequired,
  onChanged: PropTypes.func.isRequired,
};

const own = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  add: { backgroundColor: '#F3E8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  addText: { color: '#5F348F', fontWeight: '800', fontSize: 12.5 },
  link: { color: '#5F348F', fontWeight: '700', fontSize: 12.5 },
  note: { color: '#64748B', fontSize: 12, marginBottom: 10 },
});
