import { useCallback, useState } from 'react';

// Estado estructurado para cada pantalla: { data, loading, error, reload }.
export function useApi(fn, { immediate = true, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fn();
      setData(r);
      return r;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: load, run: load };
}
