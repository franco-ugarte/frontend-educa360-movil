import React, { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { asistenciaTone, colors } from '../../theme';
import { diaMes, diaSemana, hora } from '../../utils/format';
import { styles } from './AsistenciaHistorial.styles';

const ORDEN = ['PRESENTE', 'TARDANZA', 'JUSTIFICADA', 'FALTA'];
const TONE_FALLBACK = { bg: colors.surfaceAlt, text: colors.muted, label: '—' };

function toneDe(estado) {
  if (asistenciaTone[estado]) return asistenciaTone[estado];
  return { ...TONE_FALLBACK, label: estado || '—' };
}

function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

/** "Hoy" / "Ayer" / "Miércoles" para el encabezado de cada día. */
function tituloDe(fecha) {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const partes = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) return capitalizar(diaSemana(fecha)) || 'Día';
  const dia = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  const diff = Math.round((inicioHoy - dia) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return capitalizar(diaSemana(fecha)) || 'Día';
}

/** Agrupa las asistencias por fecha, manteniendo el día más reciente arriba. */
function agruparPorDia(items) {
  const mapa = new Map();

  items.forEach((item) => {
    const clave = String(item.fecha || '');
    if (!mapa.has(clave)) mapa.set(clave, []);
    mapa.get(clave).push(item);
  });

  return Array.from(mapa.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([fecha, cursos]) => {
      cursos.sort((a, b) =>
        String(a.horaInicio || '').localeCompare(String(b.horaInicio || ''))
      );

      const conteo = ORDEN.reduce((acc, estado) => {
        acc[estado] = cursos.filter((c) => c.estado === estado).length;
        return acc;
      }, {});

      const inicios = cursos.map((c) => c.horaInicio).filter(Boolean).sort();
      const fines = cursos.map((c) => c.horaFin).filter(Boolean).sort();

      return {
        fecha,
        cursos,
        conteo,
        desde: inicios[0],
        hasta: fines[fines.length - 1],
      };
    });
}

function animar() {
  if (Platform.OS === 'web') return;
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

function CursoRow({ item }) {
  const tone = toneDe(item.estado);

  return (
    <View style={styles.fila}>
      <View style={[styles.punto, { backgroundColor: tone.text }]} />
      <View style={styles.filaInfo}>
        <Text style={styles.materia} numberOfLines={1}>
          {item.materiaNombre || 'Curso'}
        </Text>
        <Text style={styles.hora}>
          {hora(item.horaInicio)}
          {item.horaFin ? ` – ${hora(item.horaFin)}` : ''}
        </Text>
        {item.observacion ? (
          <Text style={styles.observacion} numberOfLines={2}>
            {item.observacion}
          </Text>
        ) : null}
      </View>
      <View style={[styles.pill, { backgroundColor: tone.bg }]}>
        <Text style={[styles.pillText, { color: tone.text }]}>{tone.label}</Text>
      </View>
    </View>
  );
}

CursoRow.propTypes = {
  item: PropTypes.shape({
    estado: PropTypes.string,
    materiaNombre: PropTypes.string,
    horaInicio: PropTypes.string,
    horaFin: PropTypes.string,
    observacion: PropTypes.string,
  }).isRequired,
};

/**
 * Historial de asistencia agrupado por día.
 *
 * Cada día muestra un resumen por estado; al tocarlo se despliega el detalle de
 * los cursos. Se pueden tener varios días abiertos y el más reciente parte
 * abierto. En Apoderado, `renderAcciones` agrega los botones de justificación.
 */
export default function AsistenciaHistorial({ items = [], renderAcciones = null }) {
  const grupos = useMemo(() => agruparPorDia(items || []), [items]);
  const primeraFecha = grupos[0]?.fecha;
  const [abiertos, setAbiertos] = useState({});

  // El día más reciente parte abierto; los demás, cerrados. No se usa un
  // efecto: el valor por defecto se deduce de la primera fecha visible.
  const estaAbierto = (fecha) => {
    const explicito = abiertos[fecha];
    return explicito === undefined ? fecha === primeraFecha : explicito;
  };

  const alternar = (fecha) => {
    animar();
    setAbiertos((prev) => ({ ...prev, [fecha]: !estaAbierto(fecha) }));
  };

  return (
    <View>
      {grupos.map((grupo) => {
        const abierto = estaAbierto(grupo.fecha);
        const fecha = diaMes(grupo.fecha);
        const total = grupo.cursos.length;
        const rango =
          grupo.desde && grupo.hasta
            ? `${hora(grupo.desde)} a ${hora(grupo.hasta)}`
            : null;

        return (
          <View key={grupo.fecha} style={styles.grupo}>
            <Pressable
              style={({ pressed }) => [styles.cabecera, pressed && styles.cabeceraPressed]}
              onPress={() => alternar(grupo.fecha)}
              accessibilityRole="button"
              accessibilityState={{ expanded: abierto }}
              accessibilityLabel={`${tituloDe(grupo.fecha)}, ${total} cursos`}
            >
              <View style={styles.fechaBox}>
                <Text style={styles.fechaDia}>{fecha.day}</Text>
                <Text style={styles.fechaMes}>{fecha.month}</Text>
              </View>

              <View style={styles.cabeceraInfo}>
                <Text style={styles.titulo}>{tituloDe(grupo.fecha)}</Text>
                <Text style={styles.subtitulo}>
                  {total} {total === 1 ? 'curso' : 'cursos'}
                  {rango ? ` · ${rango}` : ''}
                </Text>

                <View style={styles.chips}>
                  {ORDEN.map((estado) => {
                    const n = grupo.conteo[estado];
                    if (!n) return null;
                    const tone = toneDe(estado);
                    return (
                      <View
                        key={estado}
                        style={[styles.chip, { backgroundColor: tone.bg }]}
                      >
                        <View style={[styles.chipPunto, { backgroundColor: tone.text }]} />
                        <Text style={[styles.chipTexto, { color: tone.text }]}>
                          {n} {tone.label.toLowerCase()}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.chevron, abierto && styles.chevronAbierto]}>
                <Ionicons
                  name={abierto ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.primary}
                />
              </View>
            </Pressable>

            {abierto ? (
              <View style={styles.detalle}>
                {grupo.cursos.map((item) => {
                  const acciones = renderAcciones ? renderAcciones(item) : null;
                  return (
                    <View key={item.id}>
                      <CursoRow item={item} />
                      {acciones ? <View style={styles.acciones}>{acciones}</View> : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

AsistenciaHistorial.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  renderAcciones: PropTypes.func,
};
