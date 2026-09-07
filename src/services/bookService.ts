import { supabase, SUPABASE_TABLES, isSupabaseConfigured } from '../lib/supabaseConfig';
import { Book } from '../types';
import { INITIAL_BOOKS } from '../data/initialData';
import { userService } from './userService';

const PURCHASED_BOOKS_KEY = 'tena_purchased_books';

export const bookService = {
  /**
   * Fetch all books and determine if unlocked / owned by the user
   */
  async getBooks(telegramId: number): Promise<Book[]> {
    let baseBooks = INITIAL_BOOKS;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.BOOKS)
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          baseBooks = data as Book[];
        }
      } catch (err) {
        console.warn('[Supabase books] Fetch error, using fallback:', err);
      }
    }

    // Check purchases
    let ownedBookIds: string[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: purchases } = await supabase
          .from(SUPABASE_TABLES.PURCHASES)
          .select('item_id')
          .eq('user_telegram_id', telegramId)
          .eq('item_type', 'book');

        if (purchases) {
          ownedBookIds = purchases.map((p) => p.item_id);
        }
      } catch (err) {
        console.warn('[Supabase purchases] Fetch error:', err);
      }
    }

    if (ownedBookIds.length === 0) {
      try {
        const saved = localStorage.getItem(`${PURCHASED_BOOKS_KEY}_${telegramId}`);
        if (saved) ownedBookIds = JSON.parse(saved);
      } catch {}
    }

    return baseBooks.map((b) => ({
      ...b,
      is_owned: !b.is_paid || ownedBookIds.includes(b.id),
    }));
  },

  /**
   * Buy a paid book with wallet balance
   */
  async purchaseBook(
    telegramId: number,
    book: Book,
    currentBalance: number
  ): Promise<{ success: boolean; error?: string; newBalance: number }> {
    if (currentBalance < book.price) {
      return {
        success: false,
        error: `Insufficient balance ($${currentBalance.toFixed(2)}). Please deposit to purchase "${book.title}".`,
        newBalance: currentBalance,
      };
    }

    const newBalance = Number((currentBalance - book.price).toFixed(2));

    // Update wallet balance
    await userService.updateBalance(telegramId, newBalance);

    // Save purchase locally
    const purchaseKey = `${PURCHASED_BOOKS_KEY}_${telegramId}`;
    let purchases: string[] = [];
    try {
      const saved = localStorage.getItem(purchaseKey);
      if (saved) purchases = JSON.parse(saved);
    } catch {}
    if (!purchases.includes(book.id)) {
      purchases.push(book.id);
      localStorage.setItem(purchaseKey, JSON.stringify(purchases));
    }

    // Save to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from(SUPABASE_TABLES.PURCHASES).insert({
          user_telegram_id: telegramId,
          item_type: 'book',
          item_id: book.id,
          amount: book.price,
          created_at: new Date().toISOString(),
        });

        await supabase.from(SUPABASE_TABLES.WALLET_TRANSACTIONS).insert({
          user_telegram_id: telegramId,
          type: 'purchase',
          amount: -book.price,
          status: 'approved',
          description: `Purchased Book: ${book.title}`,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[Supabase purchases] Insert error:', err);
      }
    }

    return { success: true, newBalance };
  },
};
