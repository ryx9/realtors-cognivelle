'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Fetch initial active session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // 2. Listen to real-time auth events (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local demo mode: check localStorage for simulated session
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('cognivelle_demo_auth') : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setSession(parsed.session);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
  }, []);

  const signInWithPassword = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message || null };
    }

    // Local fallback mode: allow login with any password for easy testing
    const mockUser: any = {
      id: 'usr-admin-demo',
      email,
      user_metadata: { name: email.split('@')[0] },
      created_at: new Date().toISOString(),
    };
    const mockSession: any = {
      access_token: 'demo-token',
      user: mockUser,
    };

    setUser(mockUser);
    setSession(mockSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognivelle_demo_auth', JSON.stringify({ user: mockUser, session: mockSession }));
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message || null };
    }

    return signInWithPassword(email, password);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognivelle_demo_auth');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
