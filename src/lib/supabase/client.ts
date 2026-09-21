import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEMO_ORGANIZATION, DEMO_PROFILE } from '@/src/lib/constants/demoData.ts';
import { UserSession } from '@/src/types/index.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Demo session fallback for development preview
export const DEFAULT_DEMO_SESSION: UserSession = {
  user: {
    id: DEMO_PROFILE.id,
    email: DEMO_PROFILE.email,
    full_name: DEMO_PROFILE.full_name,
    avatar_url: DEMO_PROFILE.avatar_url || undefined,
    role: DEMO_PROFILE.role,
  },
  organization: {
    id: DEMO_ORGANIZATION.id,
    name: DEMO_ORGANIZATION.name,
    slug: DEMO_ORGANIZATION.slug,
  },
};

const LOCAL_STORAGE_AUTH_KEY = 'jigaway_hub_session';

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (!raw) return DEFAULT_DEMO_SESSION; // Default to signed-in demo user for instant preview
    if (raw === 'unauthenticated') return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return DEFAULT_DEMO_SESSION;
  }
}

export function saveStoredSession(session: UserSession | null): void {
  try {
    if (!session) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'unauthenticated');
    } else {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.warn('Failed to save auth state to localStorage', err);
  }
}
