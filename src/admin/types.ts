/**
 * Admin Panel Types for Tena Holistic
 */

export type AdminSection = 'challenges' | 'books' | 'videos' | 'deposits' | 'users';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  name?: string;
  photo_url?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  reward_points: number;
  is_paid: boolean;
  price: number;
  active_date: string;
  created_at?: string;
}

export interface AdminBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  cover_url: string;
  content_url: string;
  pages: number;
  read_time_minutes: number;
  is_paid: boolean;
  price: number;
  created_at?: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  youtube_url: string;
  youtube_id?: string;
  thumbnail_url: string;
  category: string;
  duration: string;
  instructor: string;
  views?: string;
  created_at?: string;
}

export interface AdminDeposit {
  id: string;
  user_telegram_id: number;
  user_id?: string;
  type: 'deposit';
  amount: number;
  currency: 'USD' | 'ETB';
  status: 'pending' | 'approved' | 'rejected';
  proof_url?: string;
  proof_filename?: string;
  description?: string;
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
  user?: {
    name: string;
    username?: string;
    photo_url?: string;
    wallet_balance?: number;
  };
}

export interface AdminAppUser {
  id: string;
  telegram_id: number;
  name: string;
  username?: string;
  photo_url?: string;
  wallet_balance: number;
  theme: string;
  role: 'user' | 'admin';
  created_at: string;
}
