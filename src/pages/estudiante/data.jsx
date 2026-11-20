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
import * as api from '../../api/estudiante';
import { bimestres as catalogoBimestres } from '../../api/catalogos';
import { contadorNoLeidas } from '../../api/notificaciones';
import { alRecibirPush } from '../../services/push';
import { onNotificacionTiempoReal } from '../../services/realtime';
import useRecordatorios from '../../hooks/useRecordatorios';

/**
 * Datos compartidos del estudiante: matrícula, cursos, bimestres,
 * comunicados y los resúmenes anuales de notas/asistencia.
 * Las vistas de Notas y Asistencia piden sus propios filtros por bimestre.
 */
const StudentDataContext = createContext(null);

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

export function StudentDataProvider({ children }) {
  const [matricula, setMatricula] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [horario, setHorario] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [calificaciones, setCalificaciones] = useState(null);
  const [asistencias, setAsistencias] = useState(null);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  // Recordatorios locales de clase: se reprograman al cambiar el horario.
  useRecordatorios({
    rol: 'ESTUDIANTE',
    horario,
    cursos,
    seccion: matricula?.seccionEtiqueta,
  });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const [mat, cur, cal, asi, com, cnt, bim, hor] = await Promise.all([
      settle(api.miMatricula()),
      settle(api.misCursos()),
      settle(api.misCalificaciones()),
      settle(api.misAsistencias()),
      settle(api.misComunicados()),
      settle(contadorNoLeidas()),
      settle(catalogoBimestres()),
      settle(api.miHorario()),
    ]);

    if (!mounted.current) return;

    if ([cur, cal, asi, com, cnt, hor].some(isFatal)) {
      const fatal = [cur, cal, asi, com, cnt, hor].find(isFatal);
      setError(fatal.error);
    }

    if (mat.ok) setMatricula(mat.value);
    else setMatricula(null);

    if (cur.ok) setCursos(cur.value || []);
    if (hor.ok) {
      setHorario(
        (hor.value || []).map((bloque) => ({ ...bloque, id: bloque.bloqueId }))
      );
    }
    if (cal.ok) setCalificaciones(cal.value);
    if (asi.ok) setAsistencias(asi.value);
    if (com.ok) setComunicados(com.value || []);
    if (cnt.ok) setNoLeidas(cnt.value?.noLeidas ?? 0);

    if (bim.ok) {
      const anioId = mat.ok ? mat.value?.anioId : null;
      const list = bim.value || [];
      setBimestres(anioId ? list.filter((b) => b.anioId === anioId) : []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const refreshComunicados = useCallback(async () => {
    const result = await settle(api.misComunicados());
    if (result.ok && mounted.current) setComunicados(result.value || []);
    return result.ok;
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

  const value = useMemo(
    () => ({
      matricula,
      cursos,
      horario,
      bimestres,
      comunicados,
      calificaciones,
      asistencias,
      noLeidas,
      loading,
      refreshing,
      error,
      refresh,
      refreshComunicados,
      refreshNotifCount,
      setNoLeidas,
    }),
    [
      matricula,
      cursos,
      horario,
      bimestres,
      comunicados,
      calificaciones,
      asistencias,
      noLeidas,
      loading,
      refreshing,
      error,
      refresh,
      refreshComunicados,
      refreshNotifCount,
    ]
  );

  return (
    <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
  );
}

StudentDataProvider.propTypes = { children: PropTypes.node };

export function useStudentData() {
  const value = useContext(StudentDataContext);
  if (!value) throw new Error('useStudentData fuera de StudentDataProvider');
  return value;
}
