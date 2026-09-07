import { supabase, SUPABASE_TABLES, isSupabaseConfigured } from '../lib/supabaseConfig';
import { Challenge } from '../types';
import { INITIAL_CHALLENGES } from '../data/initialData';
import { userService } from './userService';

const COMPLETED_CHALLENGES_KEY = 'tena_completed_challenges';
const PURCHASED_CHALLENGES_KEY = 'tena_purchased_challenges';

export const challengeService = {
  /**
   * Fetch all daily challenges for the user, annotated with completion & ownership
   */
  async getChallenges(telegramId: number): Promise<Challenge[]> {
    let baseChallenges = INITIAL_CHALLENGES;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.CHALLENGES)
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          baseChallenges = data as Challenge[];
        }
      } catch (err) {
        console.warn('[Supabase challenges] Fetch error, using fallback data:', err);
      }
    }

    // Retrieve user completions
    let completedIds: string[] = [];
    let ownedIds: string[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: completions } = await supabase
          .from(SUPABASE_TABLES.USER_CHALLENGES)
          .select('challenge_id')
          .eq('user_telegram_id', telegramId);
        if (completions) {
          completedIds = completions.map((c) => c.challenge_id);
        }

        const { data: purchases } = await supabase
          .from(SUPABASE_TABLES.PURCHASES)
          .select('item_id')
          .eq('user_telegram_id', telegramId)
          .eq('item_type', 'challenge');
        if (purchases) {
          ownedIds = purchases.map((p) => p.item_id);
        }
      } catch (err) {
        console.warn('[Supabase user_challenges] Fetch error:', err);
      }
    }

    // Fallback to local storage if empty
    if (completedIds.length === 0) {
      try {
        const saved = localStorage.getItem(`${COMPLETED_CHALLENGES_KEY}_${telegramId}`);
        if (saved) completedIds = JSON.parse(saved);
      } catch {}
    }
    if (ownedIds.length === 0) {
      try {
        const saved = localStorage.getItem(`${PURCHASED_CHALLENGES_KEY}_${telegramId}`);
        if (saved) ownedIds = JSON.parse(saved);
      } catch {}
    }

    return baseChallenges.map((ch) => ({
      ...ch,
      completed: completedIds.includes(ch.id),
      is_owned: !ch.is_paid || ownedIds.includes(ch.id),
    }));
  },

  /**
   * Mark a challenge as complete
   */
  async completeChallenge(telegramId: number, challengeId: string): Promise<boolean> {
    // Local persistence
    const key = `${COMPLETED_CHALLENGES_KEY}_${telegramId}`;
    let completed: string[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) completed = JSON.parse(saved);
    } catch {}
    if (!completed.includes(challengeId)) {
      completed.push(challengeId);
      localStorage.setItem(key, JSON.stringify(completed));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from(SUPABASE_TABLES.USER_CHALLENGES)
          .upsert({
            user_telegram_id: telegramId,
            challenge_id: challengeId,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_telegram_id,challenge_id' });
      } catch (err) {
        console.warn('[Supabase user_challenges] Upsert error:', err);
      }
    }
    return true;
  },

  /**
   * Unlock a paid challenge by deducting from wallet balance and storing purchase
   */
  async unlockChallenge(
    telegramId: number,
    challenge: Challenge,
    currentBalance: number
  ): Promise<{ success: boolean; error?: string; newBalance: number }> {
    if (currentBalance < challenge.price) {
      return {
        success: false,
        error: `Insufficient balance ($${currentBalance.toFixed(2)}). Please deposit to unlock.`,
        newBalance: currentBalance,
      };
    }

    const newBalance = Number((currentBalance - challenge.price).toFixed(2));

    // Deduct user balance
    await userService.updateBalance(telegramId, newBalance);

    // Save purchase to local store
    const purchaseKey = `${PURCHASED_CHALLENGES_KEY}_${telegramId}`;
    let purchases: string[] = [];
    try {
      const saved = localStorage.getItem(purchaseKey);
      if (saved) purchases = JSON.parse(saved);
    } catch {}
    if (!purchases.includes(challenge.id)) {
      purchases.push(challenge.id);
      localStorage.setItem(purchaseKey, JSON.stringify(purchases));
    }

    // Save purchase and transaction in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from(SUPABASE_TABLES.PURCHASES).insert({
          user_telegram_id: telegramId,
          item_type: 'challenge',
          item_id: challenge.id,
          amount: challenge.price,
          created_at: new Date().toISOString(),
        });

        await supabase.from(SUPABASE_TABLES.WALLET_TRANSACTIONS).insert({
          user_telegram_id: telegramId,
          type: 'purchase',
          amount: -challenge.price,
          status: 'approved',
          description: `Unlocked Challenge: ${challenge.title}`,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[Supabase purchase] Insert error:', err);
      }
    }

    return { success: true, newBalance };
  },
};
