import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getToken, getStoredUser, saveSession, clearSession } from '../api/token';
import { login as apiLogin, me as apiMe } from '../api/auth';
import { mapRol } from '../api/mappers';

// Manejo de estados claro: una sola máquina { status, user, perfil, token, error }.
const initial = { status: 'loading', user: null, perfil: null, token: null, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return { status: 'ready', user: action.user, perfil: action.perfil || null, token: action.token, error: null };
    case 'LOGIN_OK':
      return { status: 'ready', user: action.user, perfil: action.perfil || null, token: action.token, error: null };
    case 'LOGIN_FAIL':
      return { ...state, status: 'ready', error: action.error };
    case 'LOGOUT':
      return { status: 'ready', user: null, perfil: null, token: null, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // useEffect: restaura sesión persistida una sola vez al arrancar.
  useEffect(() => {
    (async () => {
      const [token, user] = await Promise.all([getToken(), getStoredUser()]);
      if (token && user) {
        try {
          const fresh = await apiMe();
          await saveSession(token, fresh.usuario);
          dispatch({ type: 'RESTORE', user: fresh.usuario, perfil: fresh.perfil, token });
        } catch {
          dispatch({ type: 'RESTORE', user, perfil: null, token });
        }
      } else {
        dispatch({ type: 'RESTORE', user: null, perfil: null, token: null });
      }
    })();
  }, []);

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
          return data;
        } catch (e) {
          dispatch({ type: 'LOGIN_FAIL', error: e });
          throw e;
        }
      },
      signOut: async () => {
        await clearSession();
        dispatch({ type: 'LOGOUT' });
      },
      clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    }),
    [state]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de AuthProvider');
  return v;
}
