import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toCityVM, type CityVM } from '@/types/api';

export function useCities() {
  const [data, setData] = useState<CityVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('cities_with_counts')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setData((rows ?? []).map(toCityVM));
    setLoading(false);
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
