import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toEventVM, type EventVM } from '@/types/api';

export interface MyEventVM extends EventVM {
  status: 'draft' | 'published';
}

export function useMyEvents() {
  const { user } = useAuth();
  const [data, setData] = useState<MyEventVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('events_with_counts')
      .select(
        '*, host:profiles!host_id(id, host_name, full_name, host_bio), city:cities!city_id(id, name), category:categories!category_id(id, label)',
      )
      .eq('host_id', user.id)
      .order('start_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const vms: MyEventVM[] = (rows ?? []).map((row: any) => ({
      ...toEventVM(row, row.host, row.city, row.category),
      status: (row.status ?? 'draft') as 'draft' | 'published',
    }));
    setData(vms);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
