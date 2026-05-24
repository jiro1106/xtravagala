import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toEventVM, type EventVM } from '@/types/api';

export interface EventFilters {
  city?: string;
  category?: string;
  q?: string;
}

export function useEvents(filters: EventFilters = {}) {
  const [data, setData] = useState<EventVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => JSON.stringify({
      city: filters.city ?? '',
      category: filters.category ?? '',
      q: filters.q ?? '',
    }),
    [filters.city, filters.category, filters.q],
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from('events_with_counts')
      .select(
        '*, host:profiles!host_id(id, host_name, full_name, host_bio), city:cities!city_id(id, name), category:categories!category_id(id, label)',
      )
      .eq('status', 'published')
      .order('start_at', { ascending: true });
    if (filters.city) query = query.eq('city_id', filters.city);
    if (filters.category) query = query.eq('category_id', filters.category);

    const { data: rows, error: err } = await query;
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    let vms = (rows ?? []).map((row: any) =>
      toEventVM(row, row.host, row.city, row.category),
    );

    if (filters.q) {
      const needle = filters.q.toLowerCase();
      vms = vms.filter(
        (e) => e.title.toLowerCase().includes(needle) || e.host.toLowerCase().includes(needle),
      );
    }
    setData(vms);
    setLoading(false);
    void key;
  }, [filters.city, filters.category, filters.q, key]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
