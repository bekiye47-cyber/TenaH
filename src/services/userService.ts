import { supabase, SUPABASE_TABLES, isSupabaseConfigured } from '../lib/supabaseConfig';
import { TelegramUser } from '../types/telegram';
import { UserProfile, AppTheme } from '../types';

const USER_STORAGE_KEY = 'tena_holistic_user_profile';

export const userService = {
  /**
   * Upsert the user into the Supabase "users" table keyed by telegram_id,
   * storing name, username, and photo_url.
   */
  async upsertUser(tgUser: TelegramUser, initDataRaw?: string): Promise<UserProfile> {
    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Tena Member';
    const savedTheme = (localStorage.getItem('tena_app_theme') as AppTheme) || 'light';

    const userData: Partial<UserProfile> = {
      telegram_id: tgUser.id,
      name: fullName,
      username: tgUser.username || '',
      photo_url: tgUser.photo_url || '',
      theme: savedTheme,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // First check if user exists to preserve existing balance
        const { data: existingUser } = await supabase
          .from(SUPABASE_TABLES.USERS)
          .select('*')
          .eq('telegram_id', tgUser.id)
          .maybeSingle();

        const walletBalance = existingUser?.wallet_balance ?? 30.00; // Starter gift balance for new users
        const themeToUse = existingUser?.theme || savedTheme;

        const payload = {
          telegram_id: tgUser.id,
          name: fullName,
          username: tgUser.username || '',
          photo_url: tgUser.photo_url || '',
          wallet_balance: walletBalance,
          theme: themeToUse,
          updated_at: new Date().toISOString(),
          ...(initDataRaw ? { raw_init_data: initDataRaw } : {}),
        };

        const { data, error } = await supabase
          .from(SUPABASE_TABLES.USERS)
          .upsert(payload, { onConflict: 'telegram_id' })
          .select()
          .single();

        if (error) {
          console.warn('[Supabase users] Upsert error, falling back to local store:', error.message);
        } else if (data) {
          const profile: UserProfile = {
            telegram_id: data.telegram_id,
            name: data.name,
            username: data.username,
            photo_url: data.photo_url,
            wallet_balance: Number(data.wallet_balance) || 0,
            theme: data.theme || savedTheme,
            created_at: data.created_at,
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
          return profile;
        }
      } catch (err) {
        console.warn('[Supabase users] Network/execution error:', err);
      }
    }

    // Local persistent storage fallback
    const localSaved = localStorage.getItem(USER_STORAGE_KEY);
    let currentProfile: UserProfile;
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        currentProfile = {
          ...parsed,
          telegram_id: tgUser.id,
          name: fullName,
          username: tgUser.username || parsed.username,
          photo_url: tgUser.photo_url || parsed.photo_url,
        };
      } catch {
        currentProfile = {
          telegram_id: tgUser.id,
          name: fullName,
          username: tgUser.username,
          photo_url: tgUser.photo_url,
          wallet_balance: 30.00,
          theme: savedTheme,
        };
      }
    } else {
      currentProfile = {
        telegram_id: tgUser.id,
        name: fullName,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
        wallet_balance: 30.00, // Welcoming starter balance
        theme: savedTheme,
      };
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentProfile));
    return currentProfile;
  },

  /**
   * Sync theme setting to Supabase and localStorage
   */
  async updateTheme(telegramId: number, theme: AppTheme): Promise<void> {
    localStorage.setItem('tena_app_theme', theme);
    
    // Update local cached profile
    const local = localStorage.getItem(USER_STORAGE_KEY);
    if (local) {
      try {
        const p = JSON.parse(local);
        p.theme = theme;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(p));
      } catch {}
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from(SUPABASE_TABLES.USERS)
          .update({ theme, updated_at: new Date().toISOString() })
          .eq('telegram_id', telegramId);
      } catch (err) {
        console.warn('[Supabase users] Theme update error:', err);
      }
    }
  },

  /**
   * Update wallet balance
   */
  async updateBalance(telegramId: number, newBalance: number): Promise<void> {
    const local = localStorage.getItem(USER_STORAGE_KEY);
    if (local) {
      try {
        const p = JSON.parse(local);
        p.wallet_balance = newBalance;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(p));
      } catch {}
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from(SUPABASE_TABLES.USERS)
          .update({ wallet_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('telegram_id', telegramId);
      } catch (err) {
        console.warn('[Supabase users] Balance update error:', err);
      }
    }
  },
};
