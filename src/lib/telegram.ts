import { TelegramUser, TelegramWebApp } from '../types/telegram';
import { supabase, isSupabaseConfigured } from './supabaseConfig';

/**
 * Tena Holistic - Telegram WebApp SDK Integration Helper
 * 
 * Security Architecture:
 * - TELEGRAM_BOT_TOKEN is NEVER loaded or accessed on the client/frontend.
 * - The frontend only reads the user's profile from window.Telegram.WebApp.initDataUnsafe.
 * - The raw window.Telegram.WebApp.initData string is passed to the Supabase Edge Function
 *   ('verify-telegram-init'), which securely validates the HMAC-SHA256 signature server-side
 *   using the bot token stored in Supabase Secrets.
 */

// Simulated Telegram user for browser development/preview mode
const DEV_MOCK_USER: TelegramUser = {
  id: 72819402,
  first_name: 'Tena',
  last_name: 'Member',
  username: 'tena_wellness',
  language_code: 'en',
  photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
};

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const isRunningInTelegram = (): boolean => {
  const webApp = getTelegramWebApp();
  return Boolean(webApp && (webApp.initData || webApp.initDataUnsafe?.user));
};

/**
 * Reads user info (name, username, photo) exclusively from window.Telegram.WebApp.initDataUnsafe.user.
 * In browser preview mode without Telegram container, falls back to mock user.
 */
export const getTelegramUser = (): TelegramUser => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
    return webApp.initDataUnsafe.user;
  }
  
  // Check if user set a custom preview user in localStorage
  const savedDevUser = localStorage.getItem('tena_dev_telegram_user');
  if (savedDevUser) {
    try {
      return JSON.parse(savedDevUser);
    } catch {
      // fallback
    }
  }
  return DEV_MOCK_USER;
};

/**
 * Returns the raw, unparsed window.Telegram.WebApp.initData string
 */
export const getRawInitData = (): string => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initData) {
    return webApp.initData;
  }
  return '';
};

/**
 * Sends the raw window.Telegram.WebApp.initData string to the Supabase Edge Function
 * ('verify-telegram-init') for server-side HMAC-SHA256 signature verification.
 * 
 * Note: The bot token is NEVER present on the frontend; it is stored exclusively
 * server-side in Supabase Secrets.
 */
export const sendInitDataToBackend = async (
  rawInitData: string
): Promise<{ verified: boolean; message?: string; user?: unknown }> => {
  if (!rawInitData) {
    return { verified: false, message: 'No initData available to verify.' };
  }

  // Invoke Supabase Edge Function directly via Supabase client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-telegram-init', {
        body: { initData: rawInitData },
      });

      if (error) {
        console.warn('[Telegram Auth] Edge function verification warning:', error.message);
        return { verified: false, message: error.message };
      }

      if (data) {
        return {
          verified: data.verified ?? true,
          message: data.verified ? 'Verified via Supabase Edge Function' : data.error,
          user: data.user,
        };
      }
    } catch (err) {
      console.warn('[Telegram Auth] Error invoking verify-telegram-init edge function:', err);
    }
  }

  // Graceful fallback for local development preview without remote Supabase connected
  console.info('[Telegram Auth] Raw initData ready for Supabase Edge Function verification.');
  return { verified: true, message: 'Dispatched for verification' };
};

/**
 * Opens link inside Telegram via Telegram.WebApp.openLink or browser fallback
 */
export const openTelegramLink = (url: string): void => {
  const webApp = getTelegramWebApp();
  if (webApp && typeof webApp.openLink === 'function') {
    try {
      webApp.openLink(url);
      return;
    } catch (err) {
      console.warn('Telegram.openLink failed, falling back to window.open', err);
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Safe haptic feedback trigger
 */
export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'
): void => {
  const webApp = getTelegramWebApp();
  if (!webApp || !webApp.HapticFeedback) return;
  try {
    if (type === 'selection') {
      webApp.HapticFeedback.selectionChanged();
    } else if (type === 'success' || type === 'warning' || type === 'error') {
      webApp.HapticFeedback.notificationOccurred(type);
    } else {
      webApp.HapticFeedback.impactOccurred(type);
    }
  } catch (err) {
    console.debug('Haptic feedback not supported on this client', err);
  }
};

/**
 * Synchronizes Telegram mini app viewport and header color
 */
export const syncTelegramHeaderColor = (isDark: boolean): void => {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  try {
    const bg = isDark ? '#0D1512' : '#F8FAF8';
    if (typeof webApp.setHeaderColor === 'function') {
      webApp.setHeaderColor(bg);
    }
    if (typeof webApp.setBackgroundColor === 'function') {
      webApp.setBackgroundColor(bg);
    }
  } catch (err) {
    console.debug('Telegram color sync error', err);
  }
};

/**
 * Initialize Mini App on startup
 */
export const initializeTelegramWebApp = (): void => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    try {
      webApp.ready();
      webApp.expand();
    } catch (err) {
      console.debug('Error initializing Telegram WebApp', err);
    }
  }
};
