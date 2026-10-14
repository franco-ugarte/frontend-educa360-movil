import { API_URL, REQUEST_TIMEOUT_MS } from './config';
import { getToken } from './token';

// Cliente fetch único: inyecta JWT, timeout y traduce ApiError del backend.
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const tk = token ?? (await getToken());
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    const data = text ? safeJson(text) : null;
    if (!res.ok) {
      const err = new Error(data?.message || `Error ${res.status}`);
      err.status = res.status;
      err.fields = data?.fields || null;
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
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
