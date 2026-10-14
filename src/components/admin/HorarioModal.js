import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import PickerField from '../ui/PickerField';
import CosmicButton from '../ui/CosmicButton';
import LoadingView from '../ui/LoadingView';
import ErrorCard from '../ui/ErrorCard';
import { apiFetch } from '../../api/client';
import { reemplazarHorario } from '../../api/catalogo';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

// Editor de la hoja semanal de un curso: reemplazo completo (misma
// filosofía que habilitaciones). Bloques consecutivos no solapan.
export default function HorarioModal({ visible, curso, onClose, onSaved }) {
  const [bloques, setBloques] = useState([]);
  const [dia, setDia] = useState('LUNES');
  const [ini, setIni] = useState('08:00');
  const [fin, setFin] = useState('09:30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible || !curso) return;
    setError(null);
    setLoading(true);
    apiFetch(`/admin/cursos/${curso.id}/horario`)
      .then((r) => setBloques((r || []).map((b) => ({ dia: b.dia, horaInicio: b.horaInicio.slice(0, 5), horaFin: b.horaFin.slice(0, 5) }))))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [visible, curso]);

  const agregar = () => {
    if (!(fin > ini)) {
      setError({ status: 400, message: 'El fin debe ser posterior al inicio (HH:MM 24h).' });
      return;
    }
    setError(null);
    setBloques((p) => [...p, { dia, horaInicio: ini, horaFin: fin }]);
  };

  const guardar = async () => {
    setLoading(true);
    setError(null);
    try {
      await reemplazarHorario(curso.id, bloques);
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal visible={visible} title={`Horario · ${curso?.materiaNombre} ${curso?.seccionEtiqueta}`} onClose={onClose}>
      {loading && bloques.length === 0 ? <LoadingView message="Cargando hoja…" /> : null}
      {bloques.map((b, i) => (
        <View key={`${b.dia}-${b.horaInicio}-${i}`} style={own.row}>
          <Text style={own.rowText}>{b.dia} {b.horaInicio}–{b.horaFin}</Text>
          <TouchableOpacity onPress={() => setBloques((p) => p.filter((_, j) => j !== i))}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ))}
      {bloques.length === 0 && !loading ? (
        <Text style={own.hint}>Sin bloques: el curso aún no tiene sesiones semanales.</Text>
      ) : null}
      <Text style={own.sub}>Agregar bloque</Text>
      <PickerField label="Día" value={dia} options={DIAS.map((d) => ({ label: d, value: d }))} onSelect={setDia} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field label="Inicio (HH:MM)" value={ini} onChangeText={setIni} placeholder="08:00" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Fin (HH:MM)" value={fin} onChangeText={setFin} placeholder="09:30" />
        </View>
      </View>
      <TouchableOpacity style={own.addBtn} onPress={agregar}>
        <Text style={own.addText}>＋ Agregar a la hoja</Text>
      </TouchableOpacity>
      {error ? <ErrorCard error={error} /> : null}
      <View style={{ marginTop: 8 }}>
        <CosmicButton title="Guardar hoja completa" onPress={guardar} loading={loading} />
      </View>
    </FormModal>
  );
}

HorarioModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  curso: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

const own = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6,
  },
  rowText: { fontWeight: '700', color: '#1E1B4B', fontSize: 13.5 },
  hint: { color: '#64748B', fontSize: 12.5, marginBottom: 8 },
  sub: { fontWeight: '800', color: '#1E1B4B', marginTop: 8, marginBottom: 4 },
  addBtn: {
    borderWidth: 1.5, borderColor: '#5F348F', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', marginBottom: 4, backgroundColor: '#FAF5FF',
  },
  addText: { color: '#5F348F', fontWeight: '800' },
});
