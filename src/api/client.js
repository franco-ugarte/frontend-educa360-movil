import { API_URL, REQUEST_TIMEOUT_MS, UPLOAD_TIMEOUT_MS } from './config';
import { getToken } from './token';
import { notifyUnauthorized } from './sessionEvents';

/** Arma ?a=1&b=2 omitiendo valores nulos/vacíos. */
export function queryString(params = {}) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );
  if (!entries.length) return '';
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => search.set(key, String(value)));
  return `?${search.toString()}`;
}

// Cliente fetch único: inyecta JWT, timeout y traduce ApiError del backend.
// `formData` cambia el cuerpo a multipart y NO fija Content-Type (lo pone fetch).
async function send(
  path,
  { method = 'GET', body, token, headers, timeoutMs = REQUEST_TIMEOUT_MS, formData } = {}
) {
  const tk = token ?? (await getToken());
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(formData ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
        ...headers,
      },
      ...(formData
        ? { body: formData }
        : body !== undefined
          ? { body: JSON.stringify(body) }
          : {}),
    });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      if (res.status === 401 && tk && !path.startsWith('/auth/login')) {
        notifyUnauthorized();
      }
      const err = new Error(data?.message || `Error ${res.status}`);
      err.status = res.status;
      err.fields = data?.details || data?.fields || null;
      err.retryAfter = res.headers?.get?.('Retry-After') || null;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') {
      const t = new Error('Tiempo de espera agotado. Revisa tu conexión.');
      t.status = 0;
      throw t;
    }
    if (!e.status) {
      const t = new Error('Sin conexión con el servidor. Revisa tu red.');
      t.status = 0;
      throw t;
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function apiFetch(path, options) {
  return send(path, options);
}

/** Subida multipart (FormData con el campo `archivo`). Usa un timeout mayor. */
export function apiUpload(path, formData, options = {}) {
  return send(path, {
    ...options,
    method: options.method ?? 'POST',
    formData,
    timeoutMs: options.timeoutMs ?? UPLOAD_TIMEOUT_MS,
  });
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
