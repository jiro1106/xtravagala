import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/db';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Profile = Tables<'profiles'>;

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  requestSignOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) void fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    // Hard navigation to home so the page reloads and the logout transition
    // is unmistakable (clears any contextual state on RSVP / detail pages).
    window.location.assign('/');
  }

  function requestSignOut() {
    setConfirmOpen(true);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, requestSignOut }}>
      {children}
      <ConfirmDialog
        open={confirmOpen}
        title="Sign out?"
        description="You'll need to sign back in to RSVP, host events, or access your dashboard."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await signOut();
        }}
      />
    </AuthContext.Provider>
  );
}
