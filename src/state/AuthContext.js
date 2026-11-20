import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getToken, getStoredUser, saveSession, clearSession } from '../api/token';
import { login as apiLogin, me as apiMe, actualizarTelefonos as apiTelefonos } from '../api/auth';
import { mapRol } from '../api/mappers';
import { onUnauthorized } from '../api/sessionEvents';
import {
  configurarPush,
  eliminarPushToken,
  registrarPushToken,
} from '../services/push';
import {
  conectarRealtime,
  desconectarRealtime,
} from '../services/realtime';

// Una sola máquina de sesión: { status, user, perfil, token, error }.
const initial = { status: 'loading', user: null, perfil: null, token: null, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return {
        status: 'ready',
        user: action.user,
        perfil: action.perfil || null,
        token: action.token,
        error: null,
      };
    case 'LOGIN_OK':
      return {
        status: 'ready',
        user: action.user,
        perfil: action.perfil || null,
        token: action.token,
        error: null,
      };
    case 'LOGIN_FAIL':
      return { ...state, status: 'ready', error: action.error };
    case 'LOGOUT':
      return { status: 'ready', user: null, perfil: null, token: null, error: null };
    case 'USER_UPDATE':
      return { ...state, user: action.user };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // El handler de primer plano se instala una sola vez al arrancar.
  useEffect(() => {
    configurarPush();
  }, []);

  // Restaura la sesión persistida una sola vez al arrancar.
  useEffect(() => {
    (async () => {
      const [token, user] = await Promise.all([getToken(), getStoredUser()]);
      if (!token || !user) {
        dispatch({ type: 'RESTORE', user: null, token: null });
        return;
      }
      try {
        const fresh = await apiMe();
        await saveSession(token, fresh.usuario);
        dispatch({
          type: 'RESTORE',
          user: fresh.usuario,
          perfil: fresh.perfil,
          token,
        });
        // Con token vivo se intenta registrar el dispositivo (silencioso).
        registrarPushToken();
        conectarRealtime({ rol: fresh.usuario?.rol }).catch(() => {});
      } catch (e) {
        // Token vencido: se limpia la sesión para no entrar con credenciales muertas.
        if (e?.status === 401 || e?.status === 403) {
          await clearSession();
          dispatch({ type: 'RESTORE', user: null, token: null });
        } else {
          dispatch({ type: 'RESTORE', user, perfil: null, token });
        }
      }
    })();
  }, []);

  // Cualquier 401 con token vivo cierra la sesión y devuelve al login.
  useEffect(
    () =>
      onUnauthorized(async () => {
        desconectarRealtime();
        await eliminarPushToken();
        await clearSession();
        dispatch({ type: 'LOGOUT' });
      }),
    []
  );

  const value = useMemo(
    () => ({
      ...state,
      appRol: state.user ? mapRol(state.user.rol) : null,
      signIn: async (email, password) => {
        try {
          const data = await apiLogin(email, password);
          let perfil = null;
          try {
            perfil = (await apiMe()).perfil;
          } catch {
            perfil = null;
          }
          dispatch({ type: 'LOGIN_OK', user: data.user, perfil, token: data.token });
          registrarPushToken();
          conectarRealtime({ rol: data.user?.rol }).catch(() => {});
          return data;
        } catch (e) {
          dispatch({ type: 'LOGIN_FAIL', error: e });
          throw e;
        }
      },
      signOut: async () => {
        desconectarRealtime();
        await eliminarPushToken();
        await clearSession();
        dispatch({ type: 'LOGOUT' });
      },
      // Edición del propio perfil. El backend reemplaza la lista de teléfonos
      // y devuelve el MeResponse completo para refrescar la pantalla.
      updateTelefonos: async (telefonos) => {
        const data = await apiTelefonos(telefonos);
        const nuevo = data?.usuario || data;
        const usuario = {
          ...state.user,
          ...(nuevo && typeof nuevo === 'object' ? nuevo : {}),
          telefonos: Array.isArray(nuevo?.telefonos) ? nuevo.telefonos : telefonos,
        };
        dispatch({ type: 'USER_UPDATE', user: usuario });
        await saveSession(state.token, usuario);
        return usuario;
      },
      clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    }),
    [state]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAuth fuera de AuthProvider');
  return value;
}
