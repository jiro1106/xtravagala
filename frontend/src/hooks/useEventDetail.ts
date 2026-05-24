import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toEventVM, type EventVM } from '@/types/api';

export function useEventDetail(id: string | undefined) {
  const [data, setData] = useState<EventVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: row, error: err } = await supabase
      .from('events_with_counts')
      .select(
        '*, host:profiles!host_id(id, host_name, full_name, host_bio), city:cities!city_id(id, name), category:categories!category_id(id, label)',
      )
      .eq('id', id)
      .maybeSingle();
    if (err) {
      setError(err.message);
      setData(null);
    } else if (!row) {
      setData(null);
    } else {
      const r = row as any;
      setData(toEventVM(r, r.host, r.city, r.category));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
