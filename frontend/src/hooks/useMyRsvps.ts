import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toEventVM, type EventVM } from '@/types/api';

type JoinedRsvpRow = {
  event_id: string;
  event: Parameters<typeof toEventVM>[0] & {
    host: Parameters<typeof toEventVM>[1];
    city: Parameters<typeof toEventVM>[2];
    category: Parameters<typeof toEventVM>[3];
  } | null;
};

export function useMyRsvps() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<EventVM[]>([]);
  const [past, setPast] = useState<EventVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setUpcoming([]);
      setPast([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: rows, error: err } = await supabase
      .from('rsvps')
      .select(
        `event_id,
         event:events_with_counts!event_id (
           *,
           host:profiles!host_id(id, host_name, full_name, host_bio),
           city:cities!city_id(id, name),
           category:categories!category_id(id, label)
         )`,
      )
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const now = new Date();
    const upcomingList: EventVM[] = [];
    const pastList: EventVM[] = [];

    for (const row of (rows ?? []) as unknown as JoinedRsvpRow[]) {
      const e = row.event;
      if (!e) continue;
      const vm = toEventVM(e, e.host, e.city, e.category);
      if (vm.startAt.getTime() >= now.getTime()) upcomingList.push(vm);
      else pastList.push(vm);
    }

    upcomingList.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    pastList.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

    setUpcoming(upcomingList);
    setPast(pastList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const cancelRsvp = useCallback(
    async (eventId: string) => {
      if (!user) return;
      setUpcoming((list) => list.filter((e) => e.id !== eventId));
      setPast((list) => list.filter((e) => e.id !== eventId));
      const { error: err } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (err) {
        setError(err.message);
        void refetch();
      }
    },
    [user, refetch],
  );

  return { upcoming, past, loading, error, refetch, cancelRsvp };
}
