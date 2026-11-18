import React, { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { crearComunicado, actualizarComunicado } from '../../../api/docente';
import { friendlyError } from '../../../components/ui/ErrorCard';
import { colors } from '../../../theme';
import { styles } from '../styles';

const MAX_CONTENIDO = 5000;

function seccionesDe(cursos) {
  const mapa = new Map();
  (cursos || []).forEach((curso) => {
    if (!mapa.has(curso.seccionId)) {
      mapa.set(curso.seccionId, {
        id: curso.seccionId,
        etiqueta: curso.seccionEtiqueta,
        anioId: curso.anioId,
      });
    }
  });
  return [...mapa.values()];
}

/**
 * Alta y edición de un aviso express.
 *
 * El docente publica en UNA sola sección donde dicta clase o es tutor. Para
 * llegar a varias secciones, Secretaría o Administración publican un aviso
 * general; el móvil no lo automatiza.
 */
export default function ComunicadoForm({ cursos, initial, onCancel, onSaved }) {
  const secciones = useMemo(() => seccionesDe(cursos), [cursos]);
  const [seccionId, setSeccionId] = useState(() =>
    initial?.seccionId ?? secciones[0]?.id ?? null
  );
  const [contenido, setContenido] = useState(initial?.contenido || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSeccionId(initial?.seccionId ?? secciones[0]?.id ?? null);
    setContenido(initial?.contenido || '');
    setError(null);
  }, [initial, secciones]);

  const seleccionada = useMemo(
    () => secciones.find((seccion) => seccion.id === seccionId) || null,
    [secciones, seccionId]
  );

  const elegirSeccion = (id) => {
    setError(null);
    setSeccionId(id);
  };

  const enviar = async () => {
    if (saving) return;
    const texto = contenido.trim();
    if (!seleccionada) {
      setError('Elige la sección donde quieres publicar el aviso.');
      return;
    }
    if (!texto) {
      setError('Escribe el contenido del aviso.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (initial) {
        const item = await actualizarComunicado(initial.id, {
          seccionId: seleccionada.id,
          contenido: texto,
        });
        onSaved?.(item, { edit: true });
        return;
      }

      const item = await crearComunicado({
        anioId: seleccionada.anioId,
        seccionId: seleccionada.id,
        contenido: texto,
      });
      onSaved?.(item, { edit: false });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSaving(false);
    }
  };

  const subtitulo = seleccionada
    ? `Para las familias de ${seleccionada.etiqueta}`
    : 'Selecciona una sección';

  return (
    <View style={styles.composeCard}>
      <View style={styles.composeHead}>
        <View style={styles.composeHeadIcon}>
          <Ionicons name="megaphone-outline" size={19} color={colors.primary} />
        </View>
        <View style={styles.composeHeadText}>
          <Text style={styles.composeTitle}>
            {initial ? 'Editar aviso' : 'Nuevo aviso'}
          </Text>
          <Text style={styles.composeSubtitle} numberOfLines={1}>
            {subtitulo}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.composeClose}
          activeOpacity={0.85}
          onPress={onCancel}
          accessibilityLabel="Cerrar formulario"
        >
          <Ionicons name="close" size={17} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.composeBody}>
        <Text style={[styles.formLabel, styles.formLabelFirst]}>Sección</Text>
        <View style={styles.sectionChips}>
          {secciones.map((item) => {
            const activa = item.id === seccionId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.sectionChip, activa && styles.sectionChipActive]}
                activeOpacity={0.85}
                disabled={saving}
                onPress={() => elegirSeccion(item.id)}
                accessibilityLabel={`Sección ${item.etiqueta}`}
              >
                {activa ? (
                  <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                ) : null}
                <Text
                  style={[
                    styles.sectionChipText,
                    activa && styles.sectionChipTextActive,
                  ]}
                >
                  {item.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.formLabel}>Mensaje</Text>
        <TextInput
          style={styles.composeInput}
          value={contenido}
          onChangeText={(text) => {
            setContenido(text);
            if (error) setError(null);
          }}
          placeholder="Ej.: Mañana no habrá clases por capacitación docente…"
          placeholderTextColor={colors.faint}
          maxLength={MAX_CONTENIDO}
          multiline
          editable={!saving}
        />
        <Text style={styles.formInputCounter}>
          {contenido.length}/{MAX_CONTENIDO}
        </Text>

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          disabled={saving}
          onPress={enviar}
        >
          <Ionicons
            name={saving ? 'hourglass-outline' : 'send-outline'}
            size={17}
            color="#FFFFFF"
          />
          <Text style={styles.submitBtnText}>
            {saving
              ? 'Publicando…'
              : initial
                ? 'Guardar cambios'
                : 'Publicar aviso'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

ComunicadoForm.propTypes = {
  cursos: PropTypes.array,
  initial: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
