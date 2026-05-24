import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useRsvp(eventId: string | undefined, initialCount: number) {
  const { user } = useAuth();
  const [rsvped, setRsvped] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setCount(initialCount); }, [initialCount]);

  useEffect(() => {
    if (!eventId || !user) {
      setRsvped(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('rsvps')
      .select('event_id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setRsvped(!!data);
        setLoading(false);
      });
  }, [eventId, user]);

  const toggle = useCallback(async () => {
    if (!eventId || !user) return;
    const wasRsvped = rsvped;
    setRsvped(!wasRsvped);
    setCount((c) => c + (wasRsvped ? -1 : 1));
    setError(null);

    const op = wasRsvped
      ? supabase.from('rsvps').delete().eq('event_id', eventId).eq('user_id', user.id)
      : supabase.from('rsvps').insert({ event_id: eventId, user_id: user.id });
    const { error: err } = await op;
    if (err) {
      setRsvped(wasRsvped);
      setCount((c) => c + (wasRsvped ? 1 : -1));
      setError(err.message);
    }
  }, [eventId, user, rsvped]);

  return { rsvped, count, loading, toggle, error };
}
