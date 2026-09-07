/**
 * Tena Holistic - Application Domain Types
 */

export type AppTheme = 'light' | 'dark';

export type NavTab = 'home' | 'challenges' | 'books' | 'videos' | 'vip' | 'settings';

export interface UserProfile {
  telegram_id: number;
  name: string;
  username?: string;
  photo_url?: string;
  wallet_balance: number;
  theme: AppTheme;
  created_at?: string;
  updated_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'mindfulness' | 'movement' | 'nutrition' | 'breathwork' | 'sleep';
  duration_minutes: number;
  is_paid: boolean;
  price: number; // in USD or credits
  reward_points: number;
  completed?: boolean;
  is_owned?: boolean;
  created_at?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  description: string;
  category: string;
  pages: number;
  read_time_minutes: number;
  is_paid: boolean;
  price: number;
  excerpt?: string;
  is_owned?: boolean;
  created_at?: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string;
  category: string;
  duration: string;
  instructor: string;
  views?: string;
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'purchase' | 'reward';

export interface WalletTransaction {
  id: string;
  user_telegram_id: number;
  type: TransactionType;
  amount: number;
  currency?: 'USD' | 'ETB';
  status: TransactionStatus;
  proof_url?: string;
  proof_filename?: string;
  description?: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_telegram_id: number;
  item_type: 'book' | 'challenge';
  item_id: string;
  amount: number;
  created_at: string;
}
