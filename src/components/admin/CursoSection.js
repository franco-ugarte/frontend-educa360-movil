import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import PickerField from '../ui/PickerField';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import EmptyState from '../ui/EmptyState';
import { styles } from '../../styles/Alumno.styles';
import { crearCurso, eliminarCurso, listarHorario } from '../../api/catalogo';
import HorarioModal from './HorarioModal';

// Cursos: docente × materia × sección. Único por (materia, sección);
// exige habilitación y materia activa (409 si no). Baja física con horario.
export default function CursoSection({ cursos, docentes, materias, secciones, onChanged }) {
  const [modal, setModal] = useState(false);
  const [horarioDe, setHorarioDe] = useState(null);
  const [expandido, setExpandido] = useState(null); // id del curso con horario visible
  const [bloques, setBloques] = useState([]);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [form, setForm] = useState({ docenteId: null, materiaId: null, seccionId: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async () => {
    if (!form.docenteId || !form.materiaId || !form.seccionId) {
      setError({ status: 400, message: 'Elige docente, materia y sección.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await crearCurso(form);
      setModal(false);
      setForm({ docenteId: null, materiaId: null, seccionId: null });
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleHorario = async (curso) => {
    if (expandido === curso.id) {
      setExpandido(null);
      return;
    }
    setExpandido(curso.id);
    setCargandoBloques(true);
    try {
      setBloques((await listarHorario(curso.id)) || []);
    } catch {
      setBloques([]);
    } finally {
      setCargandoBloques(false);
    }
  };

  const borrar = (curso) => {
    Alert.alert(
      'Eliminar curso',
      `${curso.materiaNombre} ${curso.seccionEtiqueta} y su horario se borrarán. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCurso(curso.id);
              onChanged();
            } catch (e) {
              Alert.alert('Error', e.message || 'No se pudo eliminar.');
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <View style={own.head}>
        <Text style={styles.sectionTitle}>Cursos ({cursos.length})</Text>
        <TouchableOpacity style={own.add} onPress={() => { setError(null); setModal(true); }}>
          <Text style={own.addText}>＋ Nuevo</Text>
        </TouchableOpacity>
      </View>
      {cursos.map((c) => (
        <View key={c.id} style={styles.courseCardPro}>
          <View style={styles.courseTopRow}>
            <View style={styles.courseMainInfo}>
              <Text style={styles.courseTitle}>{c.materiaNombre} · {c.seccionEtiqueta}</Text>
              <Text style={styles.courseTeacherName}>{c.docenteNombre} · {c.periodoNombre}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TouchableOpacity onPress={() => toggleHorario(c)}>
              <Text style={own.link}>{expandido === c.id ? 'Ocultar horario' : 'Ver horario'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHorarioDe(c)}>
              <Text style={own.link}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => borrar(c)}>
              <Text style={[own.link, { color: '#DC2626' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
          {expandido === c.id ? (
            <View style={{ marginTop: 8, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10 }}>
              {cargandoBloques ? (
                <LoadingView message="Cargando bloques…" />
              ) : bloques.length > 0 ? (
                bloques.map((b) => (
                  <Text key={b.id} style={styles.courseMetaText}>
                    • {b.dia} {String(b.horaInicio).slice(0, 5)}–{String(b.horaFin).slice(0, 5)}
                  </Text>
                ))
              ) : (
                <Text style={styles.courseMetaText}>Sin bloques semanales.</Text>
              )}
            </View>
          ) : null}
        </View>
      ))}
      {cursos.length === 0 ? (
        <EmptyState title="Sin cursos aún" hint="Crea el curso y luego pinta su hoja semanal." />
      ) : null}
      <FormModal visible={modal} title="Nuevo curso" onClose={() => setModal(false)}>
        <PickerField
          label="Docente (con perfil)"
          value={form.docenteId}
          options={docentes.map((d) => ({ label: `${d.nombres} ${d.apellidos}`, value: d.id }))}
          onSelect={(v) => setForm({ ...form, docenteId: v })}
        />
        <PickerField
          label="Materia (activa)"
          value={form.materiaId}
          options={materias.filter((m) => m.activa).map((m) => ({ label: m.nombre, value: m.id }))}
          onSelect={(v) => setForm({ ...form, materiaId: v })}
        />
        <PickerField
          label="Sección"
          value={form.seccionId}
          options={secciones.map((s) => ({ label: `${s.etiqueta} · ${s.periodoNombre}`, value: s.id }))}
          onSelect={(v) => setForm({ ...form, seccionId: v })}
        />
        <Text style={own.note}>Único por materia+sección; exige materia habilitada al docente.</Text>
        {loading ? <LoadingView message="Creando…" /> : null}
        {error ? <ErrorCard error={error} /> : null}
        <CosmicButton title="Crear curso" onPress={guardar} loading={loading} />
      </FormModal>
      <HorarioModal
        visible={!!horarioDe}
        curso={horarioDe}
        onClose={() => setHorarioDe(null)}
        onSaved={() => { setHorarioDe(null); onChanged(); }}
      />
    </View>
  );
}

CursoSection.propTypes = {
  cursos: PropTypes.array.isRequired,
  docentes: PropTypes.array.isRequired,
  materias: PropTypes.array.isRequired,
  secciones: PropTypes.array.isRequired,
  onChanged: PropTypes.func.isRequired,
};

const own = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  add: { backgroundColor: '#F3E8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  addText: { color: '#5F348F', fontWeight: '800', fontSize: 12.5 },
  link: { color: '#5F348F', fontWeight: '700', fontSize: 12.5 },
  note: { color: '#64748B', fontSize: 12, marginBottom: 8 },
});
