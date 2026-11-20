import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import PropTypes from 'prop-types';
import * as api from '../../api/docente';
import { bimestres as catalogoBimestres } from '../../api/catalogos';
import { contadorNoLeidas } from '../../api/notificaciones';
import { alRecibirPush } from '../../services/push';
import { onNotificacionTiempoReal } from '../../services/realtime';
import useRecordatorios from '../../hooks/useRecordatorios';
import { toApiDate } from '../../utils/format';
import { hoySinHora } from '../../utils/horario';

/**
 * Datos compartidos del docente: cursos, horarios, bimestres, comunicados y
 * el contador de notificaciones. La asistencia se carga por vista porque
 * depende del bloque y la fecha elegidos.
 */
const DocenteDataContext = createContext(null);

async function settle(promise) {
  try {
    return { ok: true, value: await promise };
  } catch (error) {
    return { ok: false, error };
  }
}

function isFatal(result) {
  if (!result || result.ok) return false;
  const status = result.error?.status;
  return status === 0 || status >= 500;
}

export function DocenteDataProvider({ children }) {
  const [cursos, setCursos] = useState([]);
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [horario, setHorario] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [resumenHoy, setResumenHoy] = useState([]);
  // Cabecera del resumen: { fecha, dia, totalBloques, bloquesCompletos }.
  const [resumenHoyMeta, setResumenHoyMeta] = useState(null);
  const [comunicados, setComunicados] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  const selectedRef = useRef(selectedCursoId);

  // Recordatorios locales: clase 10 min antes + asistencia por la mañana.
  useRecordatorios({ rol: 'DOCENTE', horario, cursos });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    selectedRef.current = selectedCursoId;
  }, [selectedCursoId]);

  // Avance de asistencia de hoy (GET /docente/asistencias/resumen).
  const refreshResumenHoy = useCallback(async () => {
    try {
      const data = await api.resumenAsistencia({
        fecha: toApiDate(hoySinHora()),
      });
      if (!mounted.current) return;
      setResumenHoy(Array.isArray(data) ? data : data?.bloques || []);
      setResumenHoyMeta(
        Array.isArray(data)
          ? null
          : {
              fecha: data?.fecha || null,
              dia: data?.dia ?? null,
              totalBloques: Number(data?.totalBloques) || 0,
              bloquesCompletos: Number(data?.bloquesCompletos) || 0,
            }
      );
    } catch (error) {
      if (!mounted.current) return;
      const status = error?.status;
      if (status === 404 || status === 405 || status === 501) {
        // Backend antiguo sin el resumen: la sección de progreso no se pinta.
        setResumenHoy([]);
        setResumenHoyMeta(null);
      }
    }
  }, []);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const [cur, bim, com, cnt, hor] = await Promise.all([
      settle(api.misCursos()),
      settle(catalogoBimestres()),
      settle(api.misComunicados()),
      settle(contadorNoLeidas()),
      settle(api.miHorario()),
    ]);

    if (!mounted.current) return;

    if ([cur, bim, com, cnt, hor].some(isFatal)) {
      const fatal = [cur, bim, com, cnt, hor].find(isFatal);
      setError(fatal.error);
    }

    const lista = cur.ok ? cur.value || [] : [];
    setCursos(lista);
    if (bim.ok) setBimestres(bim.value || []);
    if (com.ok) setComunicados(com.value || []);
    if (cnt.ok) setNoLeidas(cnt.value?.noLeidas ?? 0);

    // Una sola petición trae la semana completa de todos sus cursos.
    if (hor.ok) {
      setHorario(
        (hor.value || []).map((bloque) => ({ ...bloque, id: bloque.bloqueId }))
      );
    }

    const actual = selectedRef.current;
    const siguiente = lista.some((c) => c.id === actual)
      ? actual
      : lista[0]?.id ?? null;
    setSelectedCursoId(siguiente);

    // El resumen es opcional y se pide después del bloque principal.
    await refreshResumenHoy();

    setLoading(false);
    setRefreshing(false);
  }, [refreshResumenHoy]);

  useEffect(() => {
    refresh();
    // Sólo al montar: los refrescos posteriores son explícitos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCurso = useCallback((id) => {
    if (id !== selectedRef.current) setSelectedCursoId(id);
  }, []);

  const refreshComunicados = useCallback(async () => {
    const result = await settle(api.misComunicados());
    if (result.ok && mounted.current) {
      setComunicados(result.value || []);
      return true;
    }
    return false;
  }, []);

  const upsertComunicado = useCallback((item) => {
    if (!item) return;
    setComunicados((prev) => {
      const existe = prev.some((c) => c.id === item.id);
      return existe
        ? prev.map((c) => (c.id === item.id ? item : c))
        : [item, ...prev];
    });
  }, []);

  const removeComunicado = useCallback((id) => {
    setComunicados((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const refreshNotifCount = useCallback(async () => {
    const result = await settle(contadorNoLeidas());
    if (result.ok && mounted.current) setNoLeidas(result.value?.noLeidas ?? 0);
    return result.ok ? result.value?.noLeidas ?? 0 : null;
  }, []);

  // El contador se refresca al volver a la app, por polling, push y STOMP.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshNotifCount();
    });
    const intervalo = setInterval(refreshNotifCount, 60000);
    const pushSub = alRecibirPush(() => refreshNotifCount());
    const realtimeSub = onNotificacionTiempoReal(() => refreshNotifCount());
    return () => {
      subscription.remove();
      clearInterval(intervalo);
      pushSub.remove();
      realtimeSub();
    };
  }, [refreshNotifCount]);

  const curso = useMemo(
    () => cursos.find((c) => c.id === selectedCursoId) || cursos[0] || null,
    [cursos, selectedCursoId]
  );

  // Mapa cursoId -> bloques para pintar "hoy" en Inicio sin otra petición.
  const horarios = useMemo(() => {
    const mapa = {};
    (horario || []).forEach((bloque) => {
      if (!mapa[bloque.cursoId]) mapa[bloque.cursoId] = [];
      mapa[bloque.cursoId].push(bloque);
    });
    return mapa;
  }, [horario]);

  const horariosDelCurso = useMemo(
    () => (curso ? horario.filter((bloque) => bloque.cursoId === curso.id) : []),
    [curso, horario]
  );

  // Alumnos únicos: si dicta dos materias en la misma sección no se duplican.
  const totalAlumnos = useMemo(() => {
    const porSeccion = new Map();
    cursos.forEach((item) => {
      const actual = porSeccion.get(item.seccionId) || 0;
      porSeccion.set(
        item.seccionId,
        Math.max(actual, Number(item.cantidadAlumnos) || 0)
      );
    });
    return [...porSeccion.values()].reduce((total, n) => total + n, 0);
  }, [cursos]);

  const cursoBimestres = useMemo(() => {
    if (!curso?.anioId) return [];
    return bimestres.filter((b) => b.anioId === curso.anioId);
  }, [bimestres, curso]);

  // Las vistas consumen los cursos con su sección; el formulario de avisos
  // deduplica secciones cuando el docente dicta varias materias en la misma.
  const value = useMemo(
    () => ({
      cursos,
      curso,
      selectCurso,
      horario,
      horarios,
      horariosDelCurso,
      cursoBimestres,
      totalAlumnos,
      resumenHoy,
      resumenHoyMeta,
      refreshResumenHoy,
      comunicados,
      noLeidas,
      setNoLeidas,
      loading,
      refreshing,
      error,
      refresh,
      refreshComunicados,
      upsertComunicado,
      removeComunicado,
    }),
    [
      cursos,
      curso,
      selectCurso,
      horario,
      horarios,
      horariosDelCurso,
      cursoBimestres,
      totalAlumnos,
      resumenHoy,
      resumenHoyMeta,
      refreshResumenHoy,
      comunicados,
      noLeidas,
      loading,
      refreshing,
      error,
      refresh,
      refreshComunicados,
      upsertComunicado,
      removeComunicado,
    ]
  );

  return (
    <DocenteDataContext.Provider value={value}>
      {children}
    </DocenteDataContext.Provider>
  );
}

DocenteDataProvider.propTypes = { children: PropTypes.node };

export function useDocenteData() {
  const value = useContext(DocenteDataContext);
  if (!value) throw new Error('useDocenteData fuera de DocenteDataProvider');
  return value;
}
