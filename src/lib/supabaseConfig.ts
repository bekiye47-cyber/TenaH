import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Centralized Supabase Table & Bucket configuration.
 * Change table names here if your remote schema differs.
 */
export const SUPABASE_TABLES = {
  USERS: 'users',
  CHALLENGES: 'challenges',
  USER_CHALLENGES: 'user_challenges', // join table for completed challenges
  BOOKS: 'books',
  PURCHASES: 'purchases',
  VIDEOS: 'videos',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  STORAGE_BUCKET: 'payment-proofs',
} as const;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('https://')
);

// Safe Supabase client instance (or null if not yet configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
