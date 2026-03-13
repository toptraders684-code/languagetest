import { useState, useEffect, useRef, useCallback } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fetchFn);
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    fnRef.current = fetchFn;
  });

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fnRef.current()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [depsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
