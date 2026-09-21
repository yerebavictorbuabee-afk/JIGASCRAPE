import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/src/types/index.ts';
import {
  supabase,
  isSupabaseConfigured,
  getStoredSession,
  saveStoredSession,
  DEFAULT_DEMO_SESSION,
} from '@/src/lib/supabase/client.ts';

interface AuthContextType {
  session: UserSession | null;
  user: UserSession['user'] | null;
  organization: UserSession['organization'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  useDemoSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const stored = getStoredSession();
    setSession(stored);
    setIsLoading(false);

    // If Supabase is real, listen to onAuthStateChange
    const client = supabase;
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, sbSession) => {
        if (sbSession?.user) {
          // Fetch profile and organization from Supabase
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('id, full_name, email, avatar_url, role, organization_id, organizations(id, name, slug)')
              .eq('id', sbSession.user.id)
              .single();

            if (profile) {
              const org = Array.isArray(profile.organizations)
                ? profile.organizations[0]
                : profile.organizations;

              const newSession: UserSession = {
                user: {
                  id: profile.id,
                  email: profile.email,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                  role: profile.role,
                },
                organization: {
                  id: org?.id || profile.organization_id,
                  name: org?.name || 'Jigaway',
                  slug: org?.slug || 'jigaway',
                },
              };
              setSession(newSession);
              saveStoredSession(newSession);
            }
          } catch (e) {
            console.error('Error fetching Supabase profile:', e);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          saveStoredSession(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        setIsLoading(false);
        const message = err instanceof Error ? err.message : 'Authentication failed';
        return { success: false, error: message };
      }
    }

    // Demo / Local validation
    if (!email.includes('@')) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Authenticate demo session
    const demoSession: UserSession = {
      ...DEFAULT_DEMO_SESSION,
      user: {
        ...DEFAULT_DEMO_SESSION.user,
        email: email,
        full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      },
    };

    setSession(demoSession);
    saveStoredSession(demoSession);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setSession(null);
    saveStoredSession(null);
    setIsLoading(false);
  };

  const useDemoSession = () => {
    setSession(DEFAULT_DEMO_SESSION);
    saveStoredSession(DEFAULT_DEMO_SESSION);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        organization: session?.organization || null,
        isAuthenticated: !!session?.user,
        isLoading,
        isDemoMode: !isSupabaseConfigured,
        login,
        logout,
        useDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
