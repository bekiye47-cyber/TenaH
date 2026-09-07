import { supabase, SUPABASE_TABLES, isSupabaseConfigured } from '../lib/supabaseConfig';
import { WalletTransaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/initialData';
import { userService } from './userService';

const TRANSACTIONS_STORAGE_KEY = 'tena_wallet_transactions';

export const walletService = {
  /**
   * Fetch all wallet transactions for user
   */
  async getTransactions(telegramId: number): Promise<WalletTransaction[]> {
    let list: WalletTransaction[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.WALLET_TRANSACTIONS)
          .select('*')
          .eq('user_telegram_id', telegramId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as WalletTransaction[];
        }
      } catch (err) {
        console.warn('[Supabase wallet_transactions] Fetch error:', err);
      }
    }

    // Local cached transactions
    const saved = localStorage.getItem(`${TRANSACTIONS_STORAGE_KEY}_${telegramId}`);
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {}
    } else {
      list = INITIAL_TRANSACTIONS.filter((t) => t.user_telegram_id === telegramId || t.user_telegram_id === 72819402);
      localStorage.setItem(`${TRANSACTIONS_STORAGE_KEY}_${telegramId}`, JSON.stringify(list));
    }

    return list;
  },

  /**
   * Submit a deposit request:
   * Uploads screenshot to Supabase Storage -> creates row in wallet_transactions with status "pending".
   */
  async submitDeposit(
    telegramId: number,
    amount: number,
    file?: File | null,
    currency: 'USD' | 'ETB' = 'USD'
  ): Promise<{ success: boolean; transaction?: WalletTransaction; error?: string }> {
    if (amount <= 0) {
      return { success: false, error: 'Deposit amount must be greater than zero.' };
    }

    let proofUrl = '';
    let proofFilename = file ? file.name : 'proof_payment.jpg';

    // 1. Upload to Supabase Storage if configured
    if (file && isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${telegramId}/${Date.now()}_receipt.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(SUPABASE_TABLES.STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.warn('[Supabase Storage] Upload error, continuing with fallback:', uploadError.message);
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from(SUPABASE_TABLES.STORAGE_BUCKET)
            .getPublicUrl(uploadData.path);
          proofUrl = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn('[Supabase Storage] Exception during file upload:', err);
      }
    }

    // If local or fallback file upload
    if (!proofUrl && file) {
      try {
        proofUrl = URL.createObjectURL(file);
      } catch {
        proofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80';
      }
    }

    const currencySymbol = currency === 'ETB' ? 'Birr' : '$';
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      user_telegram_id: telegramId,
      type: 'deposit',
      amount: Number(amount.toFixed(2)),
      currency: currency,
      status: 'pending',
      proof_url: proofUrl,
      proof_filename: proofFilename,
      description: `Deposit (${currency === 'ETB' ? `${amount} Birr` : `$${amount}`}) via ${proofFilename}`,
      created_at: new Date().toISOString(),
    };

    // 2. Insert into Supabase wallet_transactions table
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.WALLET_TRANSACTIONS)
          .insert({
            user_telegram_id: telegramId,
            type: 'deposit',
            amount: newTx.amount,
            status: 'pending',
            proof_url: proofUrl,
            proof_filename: proofFilename,
            description: newTx.description,
            created_at: newTx.created_at,
          })
          .select()
          .single();

        if (!error && data) {
          newTx.id = data.id || newTx.id;
        }
      } catch (err) {
        console.warn('[Supabase wallet_transactions] Insert error:', err);
      }
    }

    // 3. Update local cache
    const key = `${TRANSACTIONS_STORAGE_KEY}_${telegramId}`;
    let list: WalletTransaction[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) list = JSON.parse(saved);
    } catch {}
    list.unshift(newTx);
    localStorage.setItem(key, JSON.stringify(list));

    return { success: true, transaction: newTx };
  },

  /**
   * Simulation action: Admin approval of deposit for testing Stage 2/3 flows
   */
  async simulateAdminApproval(
    telegramId: number,
    transactionId: string,
    currentBalance: number
  ): Promise<{ success: boolean; newBalance: number }> {
    const key = `${TRANSACTIONS_STORAGE_KEY}_${telegramId}`;
    let list: WalletTransaction[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) list = JSON.parse(saved);
    } catch {}

    const txIndex = list.findIndex((t) => t.id === transactionId);
    if (txIndex === -1) return { success: false, newBalance: currentBalance };

    const tx = list[txIndex];
    if (tx.status !== 'pending') return { success: false, newBalance: currentBalance };

    tx.status = 'approved';
    const newBalance = Number((currentBalance + tx.amount).toFixed(2));
    localStorage.setItem(key, JSON.stringify(list));

    // Update user balance
    await userService.updateBalance(telegramId, newBalance);

    // Update Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from(SUPABASE_TABLES.WALLET_TRANSACTIONS)
          .update({ status: 'approved' })
          .eq('id', transactionId);
      } catch (err) {
        console.warn('[Supabase admin approve] Error:', err);
      }
    }

    return { success: true, newBalance };
  },
};
