'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '@/types/database';

interface SignUpOptions {
  fullName?: string;
  role?: UserRole;
  agentId?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInAsDemoRole: (demoRole: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  isConfigured: false,
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInAsDemoRole: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to determine role and profile from user object
  const resolveProfileForUser = useCallback(async (activeUser: User | null): Promise<UserProfile | null> => {
    if (!activeUser) return null;

    let userRole: UserRole = (activeUser.user_metadata?.role as UserRole) || 'client';
    let agentId: string | null = activeUser.user_metadata?.agent_id || null;
    let fullName: string = activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'User';

    // 1. Check if email is known admin
    const emailLower = (activeUser.email || '').toLowerCase();
    if (emailLower.startsWith('admin@') || emailLower.includes('faizan@cognivelle.com') || emailLower === 'admin@cognivellerealtors.com') {
      userRole = 'admin';
    }

    // 2. Query Supabase profiles table if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeUser.id)
          .single();

        if (profData) {
          userRole = profData.role as UserRole;
          agentId = profData.agent_id || agentId;
          fullName = profData.full_name || fullName;
        }
      } catch {
        // profiles table might not exist in database yet, fallback to user_metadata
      }

      // 3. If role is agent or email matches an agent, find their agent_id
      if (!agentId) {
        try {
          const { data: agentData } = await supabase
            .from('agents')
            .select('id, name')
            .ilike('email', activeUser.email || '')
            .single();

          if (agentData) {
            userRole = 'agent';
            agentId = agentData.id;
            fullName = agentData.name || fullName;
          }
        } catch {
          // agent lookup failed, continue
        }
      }
    }

    const resolved: UserProfile = {
      id: activeUser.id,
      email: activeUser.email || '',
      full_name: fullName,
      role: userRole,
      agent_id: agentId,
      created_at: activeUser.created_at,
    };

    return resolved;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setRole(null);
      return;
    }
    const prof = await resolveProfileForUser(user);
    setProfile(prof);
    setRole(prof?.role || 'client');
  }, [user, resolveProfileForUser]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          // 1. Fetch initial session from Supabase
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (mounted) {
            setSession(initialSession);
            const currentUser = initialSession?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
              const prof = await resolveProfileForUser(currentUser);
              if (mounted) {
                setProfile(prof);
                setRole(prof?.role || 'client');
              }
            }
            setLoading(false);
          }

          // 2. Real-time auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            const currentUser = newSession?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
              const prof = await resolveProfileForUser(currentUser);
              if (mounted) {
                setProfile(prof);
                setRole(prof?.role || 'client');
              }
            } else {
              setProfile(null);
              setRole(null);
            }
            setLoading(false);
          });

          return () => {
            subscription.unsubscribe();
          };
        } catch (err) {
          console.error('Error initializing auth:', err);
          if (mounted) setLoading(false);
        }
      } else {
        // Local demo mode: check localStorage for simulated session
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('cognivelle_demo_auth') : null;
          if (stored && mounted) {
            const parsed = JSON.parse(stored);
            setUser(parsed.user);
            setSession(parsed.session);
            setProfile(parsed.profile);
            setRole(parsed.profile?.role || 'client');
          }
        } catch {
          // ignore
        }
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [resolveProfileForUser]);

  const signInWithPassword = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }
      if (data.user) {
        const prof = await resolveProfileForUser(data.user);
        setProfile(prof);
        setRole(prof?.role || 'client');
      }
      return { error: null };
    }

    // Local fallback mode
    const roleFallback: UserRole = email.startsWith('admin') ? 'admin' : email.includes('rostova') ? 'agent' : 'client';
    const mockUser: any = {
      id: `usr-demo-${Date.now()}`,
      email,
      user_metadata: { name: email.split('@')[0], role: roleFallback },
      created_at: new Date().toISOString(),
    };
    const mockProfile: UserProfile = {
      id: mockUser.id,
      email,
      full_name: email.split('@')[0],
      role: roleFallback,
      agent_id: roleFallback === 'agent' ? 'a1111111-1111-1111-1111-111111111111' : null,
    };
    const mockSession: any = {
      access_token: 'demo-token',
      user: mockUser,
    };

    setUser(mockUser);
    setSession(mockSession);
    setProfile(mockProfile);
    setRole(roleFallback);

    if (typeof window !== 'undefined') {
      localStorage.setItem('cognivelle_demo_auth', JSON.stringify({ user: mockUser, session: mockSession, profile: mockProfile }));
    }
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    options?: SignUpOptions
  ): Promise<{ error: string | null }> => {
    const assignedRole: UserRole = options?.role || (email.startsWith('admin') ? 'admin' : 'client');
    const metadata = {
      full_name: options?.fullName || email.split('@')[0],
      role: assignedRole,
      agent_id: options?.agentId || null,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Try creating profile record in database
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: metadata.full_name,
            role: assignedRole,
            agent_id: metadata.agent_id,
          });
        } catch {
          // ignore if table not yet migrated
        }

        const prof: UserProfile = {
          id: data.user.id,
          email,
          full_name: metadata.full_name,
          role: assignedRole,
          agent_id: metadata.agent_id,
        };
        setProfile(prof);
        setRole(assignedRole);
      }
      return { error: null };
    }

    return signInWithPassword(email, password);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognivelle_demo_auth');
    }
  };

  /**
   * One-click demo switch to test any role seamlessly
   */
  const signInAsDemoRole = async (demoRole: UserRole) => {
    let email = 'admin@cognivellerealtors.com';
    let name = 'Global Managing Director';
    let agentId: string | null = null;

    if (demoRole === 'agent') {
      // Find Elena or Marcus or first agent
      if (isSupabaseConfigured && supabase) {
        const { data: agent } = await supabase.from('agents').select('id, name, email').limit(1).single();
        if (agent) {
          email = agent.email;
          name = agent.name;
          agentId = agent.id;
        }
      } else {
        email = 'elena.rostova@cognivellerealtors.com';
        name = 'Elena Rostova';
        agentId = 'a1111111-1111-1111-1111-111111111111';
      }
    } else if (demoRole === 'client') {
      email = 'eleanor.vance@luxurybuyer.com';
      name = 'Eleanor Vance (Client)';
      agentId = null;
    }

    const demoUser: any = {
      id: `usr-demo-${demoRole}`,
      email,
      user_metadata: { full_name: name, role: demoRole, agent_id: agentId },
      created_at: new Date().toISOString(),
    };

    const demoProfile: UserProfile = {
      id: demoUser.id,
      email,
      full_name: name,
      role: demoRole,
      agent_id: agentId,
      created_at: demoUser.created_at,
    };

    const demoSession: any = {
      access_token: `demo-token-${demoRole}`,
      user: demoUser,
    };

    setUser(demoUser);
    setSession(demoSession);
    setProfile(demoProfile);
    setRole(demoRole);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'cognivelle_demo_auth',
        JSON.stringify({ user: demoUser, session: demoSession, profile: demoProfile })
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signUp,
        signOut,
        signInAsDemoRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

