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
import * as api from '../../api/apoderado';
import { bimestres as catalogoBimestres } from '../../api/catalogos';
import { contadorNoLeidas } from '../../api/notificaciones';
import { useAuth } from '../../state/AuthContext';
import { alRecibirPush } from '../../services/push';
import useRecordatorios from '../../hooks/useRecordatorios';

/**
 * Datos compartidos del apoderado: hijos, hijo seleccionado, bimestres,
 * comunicados y los resúmenes anuales (notas, asistencia, tickets) del hijo
 * activo. Notas y Asistencia piden además su propio filtro por bimestre.
 */
const ApoderadoDataContext = createContext(null);

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

export function ApoderadoDataProvider({ children }) {
  const { perfil } = useAuth();
  const hijosPerfil = useMemo(() => perfil?.hijos || [], [perfil]);

  const [hijos, setHijos] = useState(hijosPerfil);
  const [selectedId, setSelectedId] = useState(hijosPerfil[0]?.estudianteId ?? null);
  const [bimestres, setBimestres] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [childData, setChildData] = useState(null);
  const [childLoading, setChildLoading] = useState(false);
  const [childLoaded, setChildLoaded] = useState(false);
  const [childError, setChildError] = useState(null);
  const [childReloadKey, setChildReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const mounted = useRef(true);
  const selectedIdRef = useRef(selectedId);
  const loadedIdRef = useRef(null);
  const childLoadedOnce = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadChild = useCallback(async (id) => {
    if (!id) {
      loadedIdRef.current = null;
      setChildData(null);
      setChildError(null);
      setChildLoading(false);
      setChildLoaded(true);
      return;
    }

    if (loadedIdRef.current !== id) {
      loadedIdRef.current = id;
      setChildData(null);
      setChildLoaded(false);
    }
    setChildLoading(true);
    setChildError(null);

    const [cal, asi, tick, hor] = await Promise.all([
      settle(api.calificacionesHijo(id)),
      settle(api.asistenciasHijo(id)),
      settle(api.ticketsHijo(id)),
      settle(api.horarioHijo(id)),
    ]);

    if (!mounted.current || selectedIdRef.current !== id) return;

    if ([cal, asi, tick, hor].some(isFatal)) {
      const fatal = [cal, asi, tick, hor].find(isFatal);
      setChildError(fatal.error);
    }

    setChildData((prev) => ({
      calificaciones: cal.ok ? cal.value : prev?.calificaciones ?? null,
      asistencias: asi.ok ? asi.value : prev?.asistencias ?? null,
      tickets: tick.ok ? tick.value || [] : prev?.tickets || [],
      horario: hor.ok
        ? (hor.value || []).map((bloque) => ({ ...bloque, id: bloque.bloqueId }))
        : prev?.horario || [],
    }));
    childLoadedOnce.current = true;
    setChildLoaded(true);
    setChildLoading(false);
  }, []);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    loadChild(selectedId);
  }, [selectedId, childReloadKey, loadChild]);

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [hij, com, cnt, bim] = await Promise.all([
        settle(api.misHijos()),
        settle(api.misComunicados()),
        settle(contadorNoLeidas()),
        settle(catalogoBimestres()),
      ]);

      if (!mounted.current) return;

      if ([hij, com, cnt, bim].some(isFatal)) {
        const fatal = [hij, com, cnt, bim].find(isFatal);
        setError(fatal.error);
      }

      let lista = hij.ok ? hij.value || [] : [];
      if (!hij.ok && hijosPerfil.length) lista = hijosPerfil;
      setHijos(lista);

      if (com.ok) setComunicados(com.value || []);
      if (cnt.ok) setNoLeidas(cnt.value?.noLeidas ?? 0);
      if (bim.ok) setBimestres(bim.value || []);

      const current = selectedIdRef.current;
      const next = lista.some((h) => h.estudianteId === current)
        ? current
        : lista[0]?.estudianteId ?? null;
      setSelectedId(next);
      if (childLoadedOnce.current) setChildReloadKey((k) => k + 1);

      setLoading(false);
      setRefreshing(false);
    },
    [hijosPerfil]
  );

  useEffect(() => {
    refresh();
    // Sólo al montar: los refrescos posteriores son explícitos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectChild = useCallback((id) => {
    if (id !== selectedIdRef.current) setSelectedId(id);
  }, []);

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

  /**
   * Refresca el historial del hijo activo y devuelve la lista fresca (o
   * `false` si falló). El formulario la usa para validar duplicados contra el
   * servidor y no contra datos viejos de memoria.
   */
  const refreshTickets = useCallback(async () => {
    const id = selectedIdRef.current;
    if (!id) return false;
    const result = await settle(api.ticketsHijo(id));
    if (result.ok && mounted.current && selectedIdRef.current === id) {
      const lista = result.value || [];
      setChildData((prev) => (prev ? { ...prev, tickets: lista } : prev));
      return lista;
    }
    return false;
  }, []);

  /** Inserta o reemplaza un ticket (creado o con sustento) en el historial. */
  const upsertTicket = useCallback((ticket) => {
    if (!ticket) return;
    // Evita mezclar tickets de un hijo si la respuesta llega después de cambiar
    // de hijo en el selector.
    if (ticket.estudianteId != null && ticket.estudianteId !== selectedIdRef.current) {
      return;
    }
    setChildData((prev) => {
      if (!prev) return prev;
      const list = prev.tickets || [];
      const exists = list.some((t) => t.id === ticket.id);
      const tickets = exists
        ? list.map((t) => (t.id === ticket.id ? ticket : t))
        : [ticket, ...list];
      return { ...prev, tickets };
    });
  }, []);

  // El contador se refresca al volver a la app, cada minuto y al recibir push.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshNotifCount();
    });
    const intervalo = setInterval(refreshNotifCount, 60000);
    const pushSub = alRecibirPush(() => refreshNotifCount());
    return () => {
      subscription.remove();
      clearInterval(intervalo);
      pushSub.remove();
    };
  }, [refreshNotifCount]);

  const hijo = useMemo(
    () => hijos.find((h) => h.estudianteId === selectedId) || hijos[0] || null,
    [hijos, selectedId]
  );

  const horarioHijo = useMemo(() => childData?.horario || [], [childData]);

  // Recordatorios del hijo activo: al cambiar de hijo se reprograman.
  useRecordatorios({
    rol: 'APODERADO',
    horario: horarioHijo,
    nombre: hijo?.nombres,
    seccion: hijo?.seccionEtiqueta,
  });

  // HijoResponse trae anioId del año vigente: se usa para filtrar bimestres.
  const childBimestres = useMemo(() => {
    if (hijo?.anioId == null) return [];
    return bimestres.filter((b) => b.anioId === hijo.anioId);
  }, [bimestres, hijo]);

  const value = useMemo(
    () => ({
      hijos,
      hijo,
      selectChild,
      bimestres,
      childBimestres,
      comunicados,
      noLeidas,
      setNoLeidas,
      calificaciones: childData?.calificaciones ?? null,
      asistencias: childData?.asistencias ?? null,
      tickets: childData?.tickets || [],
      horario: childData?.horario || [],
      childLoading,
      childLoaded,
      childError,
      loading,
      refreshing,
      error,
      refresh,
      refreshComunicados,
      refreshNotifCount,
      refreshTickets,
      upsertTicket,
    }),
    [
      hijos,
      hijo,
      selectChild,
      bimestres,
      childBimestres,
      comunicados,
      noLeidas,
      childData,
      childLoading,
      childLoaded,
      childError,
      loading,
      refreshing,
      error,
      refresh,
      refreshComunicados,
      refreshNotifCount,
      refreshTickets,
      upsertTicket,
    ]
  );

  return (
    <ApoderadoDataContext.Provider value={value}>
      {children}
    </ApoderadoDataContext.Provider>
  );
}

ApoderadoDataProvider.propTypes = { children: PropTypes.node };

export function useApoderadoData() {
  const value = useContext(ApoderadoDataContext);
  if (!value) throw new Error('useApoderadoData fuera de ApoderadoDataProvider');
  return value;
}
