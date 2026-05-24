import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toCategoryVM, type CategoryVM } from '@/types/api';

export function useCategories() {
  const [data, setData] = useState<CategoryVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setData((rows ?? []).map(toCategoryVM));
    setLoading(false);
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
