import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  },

  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    
    // Create initial user profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: data.user.id,
        name,
        email,
        total_exp: 0,
        level: 1,
        stats: {
          strength: 1,
          intelligence: 1,
          agility: 1,
          charisma: 1,
          vitality: 1,
          mana: 1,
        },
        titles: [],
        quests: [],
        skills: [],
        achievements: [],
      });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  initialize: async () => {
    set({ loading: true });
    
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null });
    });
  },
}));