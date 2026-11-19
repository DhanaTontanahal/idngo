import { useCallback, useEffect, useState } from 'react';
import { getApplication } from '../api/mockApi';
import { normaliseReference } from '../format';

export function useApplication(reference) {
  const ref = normaliseReference(reference);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApplication(ref);
      setApplication(result);
      return result;
    } catch (err) {
      setApplication(null);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [ref]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setApplication(null);
    getApplication(ref)
      .then((result) => {
        if (active) setApplication(result);
      })
      .catch((err) => {
        if (!active) return;
        setApplication(null);
        setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ref]);

  return { application, setApplication, error, loading, reload, reference: ref };
}
