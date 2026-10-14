import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import PickerField from '../ui/PickerField';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { styles } from '../../styles/Alumno.styles';
import { habilitarMaterias } from '../../api/catalogo';

// Habilitaciones: qué materias PUEDE enseñar cada docente.
// El PUT reemplaza el conjunto completo: se marca todo y se guarda.
export default function HabilitacionesSection({ docentes, materias, onChanged }) {
  const [docenteId, setDocenteId] = useState(docentes[0]?.id || null);
  const [sel, setSel] = useState(null); // null = sin tocar; array = selección
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);

  const docente = docentes.find((d) => d.id === docenteId);
  const current = sel !== null ? sel : (docente?.materias || []).map((m) => m.id);

  const toggle = (id) => {
    setOk(null);
    setError(null);
    const base = sel !== null ? sel : (docente?.materias || []).map((m) => m.id);
    setSel(base.includes(id) ? base.filter((x) => x !== id) : [...base, id]);
  };

  const guardar = async () => {
    if (!docente) return;
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      await habilitarMaterias(docente.id, current);
      setSel(null);
      setOk('Habilitaciones guardadas.');
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Habilitaciones</Text>
      <Text style={[styles.sectionSubtitle, { marginBottom: 8 }]}>Qué puede enseñar cada docente</Text>
      <PickerField
        label="Docente"
        value={docenteId}
        options={docentes.map((d) => ({ label: `${d.nombres} ${d.apellidos}`, value: d.id }))}
        onSelect={(v) => { setDocenteId(v); setSel(null); setOk(null); setError(null); }}
      />
      <View style={own.chips}>
        {materias.filter((m) => m.activa).map((m) => {
          const on = current.includes(m.id);
          return (
            <TouchableOpacity
              key={m.id}
              style={[own.chip, on && own.chipOn]}
              onPress={() => toggle(m.id)}
              activeOpacity={0.8}
            >
              <Text style={[own.chipText, on && own.chipTextOn]}>{m.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {loading ? <LoadingView message="Guardando…" /> : null}
      {error ? <ErrorCard error={error} /> : null}
      {ok ? <Text style={own.ok}>{ok}</Text> : null}
      <CosmicButton title="Guardar habilitaciones" onPress={guardar} loading={loading} disabled={!docente} />
    </View>
  );
}

HabilitacionesSection.propTypes = {
  docentes: PropTypes.array.isRequired,
  materias: PropTypes.array.isRequired,
  onChanged: PropTypes.func.isRequired,
};

const own = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F8FAFC' },
  chipOn: { borderColor: '#5F348F', backgroundColor: '#F3E8FF' },
  chipText: { color: '#64748B', fontWeight: '700', fontSize: 13 },
  chipTextOn: { color: '#5F348F' },
  ok: { color: '#059669', fontWeight: '700', marginBottom: 8 },
});
