import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  AdminChallenge, 
  AdminBook, 
  AdminVideo, 
  AdminDeposit, 
  AdminAppUser, 
  AdminUser 
} from '../types';
import { INITIAL_CHALLENGES, INITIAL_BOOKS, INITIAL_VIDEOS, INITIAL_TRANSACTIONS } from '../../data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseLive = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('https://')
);

export const adminSupabase: SupabaseClient | null = isSupabaseLive
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local fallback simulation storage keys for preview before connecting real keys
const LOCAL_CHALLENGES_KEY = 'tena_admin_sim_challenges';
const LOCAL_BOOKS_KEY = 'tena_admin_sim_books';
const LOCAL_VIDEOS_KEY = 'tena_admin_sim_videos';
const LOCAL_TRANSACTIONS_KEY = 'tena_admin_sim_transactions';
const LOCAL_USERS_KEY = 'tena_admin_sim_users';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export const adminService = {
  // ============================================================================
  // AUTH & ACCESS CONTROL
  // ============================================================================

  async signIn(email: string, password: string): Promise<AdminUser> {
    if (!isSupabaseLive || !adminSupabase) {
      // Demo login when Supabase credentials are not connected
      if (email.toLowerCase().includes('admin') || password === 'admin123') {
        const demoAdmin: AdminUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: email || 'admin@tenaholistic.com',
          role: 'admin',
          name: 'Dr. Selamawit Tena (Admin)',
          photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        };
        localStorage.setItem('tena_active_admin', JSON.stringify(demoAdmin));
        return demoAdmin;
      }
      throw new Error('Supabase credentials not configured in .env. Enter "admin@tenaholistic.com" and "admin123" to explore in preview mode.');
    }

    // Real Supabase Auth sign in
    const { data: authData, error: authError } = await adminSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Authentication failed');
    }

    const authUserId = authData.user.id;
    const authEmail = authData.user.email || email;

    // Check the user's role in the "users" table
    const { data: userRow, error: roleError } = await adminSupabase
      .from('users')
      .select('id, role, name, first_name, photo_url')
      .or(`id.eq.${authUserId},email.eq.${authEmail}`)
      .maybeSingle();

    if (roleError) {
      console.warn('Role verification lookup error:', roleError);
    }

    if (!userRow || userRow.role !== 'admin') {
      // Immediately log them out as required by ACCESS CONTROL
      await adminSupabase.auth.signOut();
      throw new Error('Access denied: Your account does not have administrator privileges (role != "admin"). Please update your user row in the Supabase Table Editor.');
    }

    const adminProfile: AdminUser = {
      id: userRow.id || authUserId,
      email: authEmail,
      role: 'admin',
      name: userRow.name || userRow.first_name || authEmail.split('@')[0],
      photo_url: userRow.photo_url || '',
    };

    localStorage.setItem('tena_active_admin', JSON.stringify(adminProfile));
    return adminProfile;
  },

  async signUp(email: string, password: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseLive || !adminSupabase) {
      throw new Error('Supabase credentials not configured in environment.');
    }

    const { data, error } = await adminSupabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Auto-create initial user row in public.users if possible
    if (data.user) {
      try {
        await adminSupabase.from('users').upsert({
          id: data.user.id,
          telegram_id: Math.floor(100000000 + Math.random() * 900000000),
          name: email.split('@')[0],
          role: 'user', // Default is user; prompt asks admin to manually promote in Supabase
          wallet_balance: 50.00,
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Sign-up user record upsert notice:', err);
      }
    }

    return {
      success: true,
      message: 'Account created. To grant admin access, open your Supabase Table Editor on the "users" table and set your row\'s role column to "admin".',
    };
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('tena_active_admin');
    if (adminSupabase) {
      try {
        await adminSupabase.auth.signOut();
      } catch {}
    }
  },

  async getSessionAdmin(): Promise<AdminUser | null> {
    const cached = localStorage.getItem('tena_active_admin');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    if (isSupabaseLive && adminSupabase) {
      const { data: { session } } = await adminSupabase.auth.getSession();
      if (session?.user) {
        const { data: userRow } = await adminSupabase
          .from('users')
          .select('id, role, name, photo_url')
          .or(`id.eq.${session.user.id},email.eq.${session.user.email}`)
          .maybeSingle();

        if (userRow?.role === 'admin') {
          const profile: AdminUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'admin',
            name: userRow.name || session.user.email?.split('@')[0],
            photo_url: userRow.photo_url || '',
          };
          localStorage.setItem('tena_active_admin', JSON.stringify(profile));
          return profile;
        }
      }
    }
    return null;
  },

  // ============================================================================
  // FILE UPLOADS (MEDIA BUCKET)
  // ============================================================================

  async uploadMedia(file: File, folder: string = 'covers'): Promise<string> {
    if (!isSupabaseLive || !adminSupabase) {
      // Local object URL fallback
      return URL.createObjectURL(file);
    }

    const cleanExt = file.name.split('.').pop() || 'png';
    const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${cleanExt}`;

    const { data, error } = await adminSupabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(`Media upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from('media')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  // ============================================================================
  // SECTION 1: CHALLENGES
  // ============================================================================

  async getChallenges(): Promise<AdminChallenge[]> {
    if (isSupabaseLive && adminSupabase) {
      const { data, error } = await adminSupabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((ch: any) => ({
          id: ch.id,
          title: ch.title,
          description: ch.description || '',
          category: ch.category || 'mindfulness',
          duration_minutes: ch.duration_minutes || 5,
          reward_points: ch.reward_points || 10,
          is_paid: Boolean(ch.is_paid),
          price: Number(ch.price || 0),
          active_date: ch.active_date || new Date().toISOString().split('T')[0],
          created_at: ch.created_at,
        }));
      }
    }

    // Local fallback
    const local = getLocal<AdminChallenge[]>(LOCAL_CHALLENGES_KEY, []);
    if (local.length > 0) return local;

    const initial: AdminChallenge[] = INITIAL_CHALLENGES.map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      category: ch.category,
      duration_minutes: ch.duration_minutes,
      reward_points: ch.reward_points,
      is_paid: ch.is_paid,
      price: ch.price,
      active_date: new Date().toISOString().split('T')[0],
      created_at: ch.created_at || new Date().toISOString(),
    }));
    setLocal(LOCAL_CHALLENGES_KEY, initial);
    return initial;
  },

  async saveChallenge(challenge: Partial<AdminChallenge>): Promise<AdminChallenge> {
    const payload = {
      title: challenge.title,
      description: challenge.description || '',
      category: challenge.category || 'mindfulness',
      duration_minutes: challenge.duration_minutes || 5,
      reward_points: challenge.reward_points || 10,
      is_paid: Boolean(challenge.is_paid),
      price: challenge.is_paid ? Number(challenge.price || 0) : 0,
      active_date: challenge.active_date || new Date().toISOString().split('T')[0],
    };

    if (isSupabaseLive && adminSupabase) {
      if (challenge.id) {
        const { data, error } = await adminSupabase
          .from('challenges')
          .update(payload)
          .eq('id', challenge.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await adminSupabase
          .from('challenges')
          .insert([payload])
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
    }

    // Local simulation
    const list = await this.getChallenges();
    let saved: AdminChallenge;
    if (challenge.id) {
      list.forEach((item, index) => {
        if (item.id === challenge.id) {
          list[index] = { ...item, ...payload };
          saved = list[index];
        }
      });
      saved = saved! || { ...payload, id: challenge.id };
    } else {
      saved = {
        ...payload,
        id: `ch_${Date.now()}`,
        created_at: new Date().toISOString(),
      } as AdminChallenge;
      list.unshift(saved);
    }
    setLocal(LOCAL_CHALLENGES_KEY, list);
    return saved;
  },

  async deleteChallenge(id: string): Promise<void> {
    if (isSupabaseLive && adminSupabase) {
      const { error } = await adminSupabase.from('challenges').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const list = (await this.getChallenges()).filter((ch) => ch.id !== id);
    setLocal(LOCAL_CHALLENGES_KEY, list);
  },

  // ============================================================================
  // SECTION 2: BOOKS
  // ============================================================================

  async getBooks(): Promise<AdminBook[]> {
    if (isSupabaseLive && adminSupabase) {
      const { data, error } = await adminSupabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((b: any) => ({
          id: b.id,
          title: b.title,
          author: b.author || 'Tena Holistic',
          description: b.description || '',
          category: b.category || 'Wellness',
          cover_url: b.cover_url || b.cover_image_url || '',
          content_url: b.content_url || b.file_url || '',
          pages: b.pages || 100,
          read_time_minutes: b.read_time_minutes || 45,
          is_paid: Boolean(b.is_paid),
          price: Number(b.price || 0),
          created_at: b.created_at,
        }));
      }
    }

    const local = getLocal<AdminBook[]>(LOCAL_BOOKS_KEY, []);
    if (local.length > 0) return local;

    const initial: AdminBook[] = INITIAL_BOOKS.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description,
      category: b.category,
      cover_url: b.cover_url,
      content_url: 'https://example.com/books/sample.pdf',
      pages: b.pages,
      read_time_minutes: b.read_time_minutes,
      is_paid: b.is_paid,
      price: b.price,
      created_at: b.created_at || new Date().toISOString(),
    }));
    setLocal(LOCAL_BOOKS_KEY, initial);
    return initial;
  },

  async saveBook(book: Partial<AdminBook>): Promise<AdminBook> {
    const payload = {
      title: book.title,
      author: book.author || 'Tena Holistic',
      description: book.description || '',
      category: book.category || 'Wellness',
      cover_url: book.cover_url || '',
      cover_image_url: book.cover_url || '',
      content_url: book.content_url || '',
      file_url: book.content_url || '',
      pages: Number(book.pages || 100),
      read_time_minutes: Number(book.read_time_minutes || 45),
      is_paid: Boolean(book.is_paid),
      price: book.is_paid ? Number(book.price || 0) : 0,
    };

    if (isSupabaseLive && adminSupabase) {
      if (book.id) {
        const { data, error } = await adminSupabase
          .from('books')
          .update(payload)
          .eq('id', book.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await adminSupabase
          .from('books')
          .insert([payload])
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
    }

    const list = await this.getBooks();
    let saved: AdminBook;
    if (book.id) {
      list.forEach((item, index) => {
        if (item.id === book.id) {
          list[index] = { ...item, ...payload };
          saved = list[index];
        }
      });
      saved = saved! || { ...payload, id: book.id };
    } else {
      saved = {
        ...payload,
        id: `bk_${Date.now()}`,
        created_at: new Date().toISOString(),
      } as AdminBook;
      list.unshift(saved);
    }
    setLocal(LOCAL_BOOKS_KEY, list);
    return saved;
  },

  async deleteBook(id: string): Promise<void> {
    if (isSupabaseLive && adminSupabase) {
      const { error } = await adminSupabase.from('books').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const list = (await this.getBooks()).filter((b) => b.id !== id);
    setLocal(LOCAL_BOOKS_KEY, list);
  },

  // ============================================================================
  // SECTION 3: VIDEOS (ALWAYS FREE)
  // ============================================================================

  async getVideos(): Promise<AdminVideo[]> {
    if (isSupabaseLive && adminSupabase) {
      const { data, error } = await adminSupabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((v: any) => ({
          id: v.id,
          title: v.title,
          youtube_url: v.youtube_url,
          youtube_id: v.youtube_id || extractYoutubeId(v.youtube_url),
          thumbnail_url: v.thumbnail_url || `https://img.youtube.com/vi/${extractYoutubeId(v.youtube_url)}/hqdefault.jpg`,
          category: v.category || 'movement',
          duration: v.duration || '10 min',
          instructor: v.instructor || 'Tena Holistic',
          views: v.views || '1.5k',
          created_at: v.created_at,
        }));
      }
    }

    const local = getLocal<AdminVideo[]>(LOCAL_VIDEOS_KEY, []);
    if (local.length > 0) return local;

    const initial: AdminVideo[] = INITIAL_VIDEOS.map((v) => ({
      id: v.id,
      title: v.title,
      youtube_url: v.youtube_url,
      youtube_id: v.youtube_id,
      thumbnail_url: v.thumbnail_url,
      category: v.category,
      duration: v.duration,
      instructor: v.instructor,
      views: v.views,
      created_at: new Date().toISOString(),
    }));
    setLocal(LOCAL_VIDEOS_KEY, initial);
    return initial;
  },

  async saveVideo(video: Partial<AdminVideo>): Promise<AdminVideo> {
    const youtubeId = extractYoutubeId(video.youtube_url || '') || video.youtube_id || '';
    const defaultThumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '';

    const payload = {
      title: video.title,
      youtube_url: video.youtube_url || '',
      youtube_id: youtubeId,
      thumbnail_url: video.thumbnail_url || defaultThumb,
      category: video.category || 'movement',
      duration: video.duration || '10 min',
      instructor: video.instructor || 'Tena Holistic',
      views: video.views || '1.2k',
    };

    if (isSupabaseLive && adminSupabase) {
      if (video.id) {
        const { data, error } = await adminSupabase
          .from('videos')
          .update(payload)
          .eq('id', video.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await adminSupabase
          .from('videos')
          .insert([payload])
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
    }

    const list = await this.getVideos();
    let saved: AdminVideo;
    if (video.id) {
      list.forEach((item, index) => {
        if (item.id === video.id) {
          list[index] = { ...item, ...payload };
          saved = list[index];
        }
      });
      saved = saved! || { ...payload, id: video.id };
    } else {
      saved = {
        ...payload,
        id: `vid_${Date.now()}`,
        created_at: new Date().toISOString(),
      } as AdminVideo;
      list.unshift(saved);
    }
    setLocal(LOCAL_VIDEOS_KEY, list);
    return saved;
  },

  async deleteVideo(id: string): Promise<void> {
    if (isSupabaseLive && adminSupabase) {
      const { error } = await adminSupabase.from('videos').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const list = (await this.getVideos()).filter((v) => v.id !== id);
    setLocal(LOCAL_VIDEOS_KEY, list);
  },

  // ============================================================================
  // SECTION 4: DEPOSITS & WALLET APPROVALS
  // ============================================================================

  async getDeposits(statusFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'pending'): Promise<AdminDeposit[]> {
    if (isSupabaseLive && adminSupabase) {
      let query = adminSupabase
        .from('wallet_transactions')
        .select(`
          *,
          user:users (
            name,
            username,
            photo_url,
            wallet_balance
          )
        `)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((tx: any) => ({
          id: tx.id,
          user_telegram_id: tx.user_telegram_id,
          user_id: tx.user_id,
          type: 'deposit',
          amount: Number(tx.amount),
          currency: tx.currency || 'USD',
          status: tx.status,
          proof_url: tx.proof_url || tx.proof_image_url,
          proof_filename: tx.proof_filename,
          description: tx.description,
          admin_note: tx.admin_note,
          created_at: tx.created_at,
          reviewed_at: tx.reviewed_at,
          user: tx.user || {
            name: `User #${tx.user_telegram_id}`,
            username: '',
            photo_url: '',
            wallet_balance: 0,
          },
        }));
      }
    }

    // Local simulation
    const local = getLocal<AdminDeposit[]>(LOCAL_TRANSACTIONS_KEY, []);
    let list: AdminDeposit[];
    if (local.length > 0) {
      list = local;
    } else {
      list = [
        {
          id: 'tx_demo_01',
          user_telegram_id: 72819402,
          type: 'deposit',
          amount: 50.00,
          currency: 'USD',
          status: 'pending',
          proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700',
          proof_filename: 'cbe_transfer_receipt.jpg',
          description: 'CBE Birr bank mobile slip',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: {
            name: 'Yared Alemu',
            username: 'yared_mindful',
            photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            wallet_balance: 35.00,
          },
        },
        {
          id: 'tx_demo_02',
          user_telegram_id: 84920194,
          type: 'deposit',
          amount: 25.00,
          currency: 'USD',
          status: 'pending',
          proof_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=700',
          proof_filename: 'telebirr_payment.png',
          description: 'Telebirr SuperApp confirmation screenshot',
          created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          user: {
            name: 'Sara Kifle',
            username: 'sara_wellness',
            photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            wallet_balance: 12.50,
          },
        },
        {
          id: 'tx_demo_03',
          user_telegram_id: 93847291,
          type: 'deposit',
          amount: 100.00,
          currency: 'USD',
          status: 'approved',
          proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700',
          proof_filename: 'bank_wire.pdf',
          description: 'Awash Bank Swift transfer',
          admin_note: 'Verified with bank statement Ref# AW-9923',
          created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          reviewed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          user: {
            name: 'Dawit Mengistu',
            username: 'dawit_m',
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            wallet_balance: 145.00,
          },
        },
      ];
      setLocal(LOCAL_TRANSACTIONS_KEY, list);
    }

    if (statusFilter === 'all') return list;
    return list.filter((tx) => tx.status === statusFilter);
  },

  async approveDeposit(transactionId: string, adminNote?: string): Promise<{ success: boolean; message: string }> {
    if (isSupabaseLive && adminSupabase) {
      // 1. Try invoking the Edge Function approve-deposit
      try {
        const { data, error } = await adminSupabase.functions.invoke('approve-deposit', {
          body: {
            wallet_transaction_id: transactionId,
            decision: 'approved',
            admin_note: adminNote || 'Approved via Admin Dashboard',
          },
        });
        if (!error && data?.success) {
          return { success: true, message: `Deposit approved. Credited $${data.amount} to user wallet.` };
        }
      } catch (fnErr) {
        console.warn('Edge function invoke failed, trying atomic RPC procedure:', fnErr);
      }

      // 2. Fallback to direct Postgres atomic procedure
      const { data: rpcData, error: rpcError } = await adminSupabase.rpc('approve_deposit_atomic', {
        p_transaction_id: transactionId,
        p_decision: 'approved',
        p_admin_note: adminNote || 'Approved by administrator',
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true, message: `Deposit approved. User wallet balance updated to $${rpcData?.user_wallet_balance || ''}` };
    }

    // Local simulation
    const all = await this.getDeposits('all');
    let target = all.find((t) => t.id === transactionId);
    if (target) {
      target.status = 'approved';
      target.admin_note = adminNote || 'Approved by administrator in demo';
      target.reviewed_at = new Date().toISOString();
      if (target.user) {
        target.user.wallet_balance = (target.user.wallet_balance || 0) + target.amount;
      }
      setLocal(LOCAL_TRANSACTIONS_KEY, all);
    }
    return { success: true, message: `Deposit of $${target?.amount} approved and balance updated.` };
  },

  async rejectDeposit(transactionId: string, adminNote: string): Promise<{ success: boolean; message: string }> {
    if (!adminNote || adminNote.trim() === '') {
      adminNote = 'Deposit verification rejected by administrator';
    }

    if (isSupabaseLive && adminSupabase) {
      // Try Edge function first
      try {
        const { data, error } = await adminSupabase.functions.invoke('approve-deposit', {
          body: {
            wallet_transaction_id: transactionId,
            decision: 'rejected',
            admin_note: adminNote,
          },
        });
        if (!error && data?.success) {
          return { success: true, message: 'Deposit rejected.' };
        }
      } catch (fnErr) {
        console.warn('Edge function invoke failed, trying atomic RPC procedure:', fnErr);
      }

      // Fallback to Postgres RPC
      const { error: rpcError } = await adminSupabase.rpc('approve_deposit_atomic', {
        p_transaction_id: transactionId,
        p_decision: 'rejected',
        p_admin_note: adminNote,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true, message: 'Deposit rejected with admin note recorded.' };
    }

    // Local simulation
    const all = await this.getDeposits('all');
    let target = all.find((t) => t.id === transactionId);
    if (target) {
      target.status = 'rejected';
      target.admin_note = adminNote;
      target.reviewed_at = new Date().toISOString();
      setLocal(LOCAL_TRANSACTIONS_KEY, all);
    }
    return { success: true, message: 'Deposit rejected and reason recorded.' };
  },

  // ============================================================================
  // SECTION 5: USERS
  // ============================================================================

  async getUsers(search: string = ''): Promise<AdminAppUser[]> {
    if (isSupabaseLive && adminSupabase) {
      let query = adminSupabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((u: any) => ({
          id: u.id,
          telegram_id: u.telegram_id,
          name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Tena Member',
          username: u.username || '',
          photo_url: u.photo_url || '',
          wallet_balance: Number(u.wallet_balance || 0),
          theme: u.theme || u.theme_preference || 'light',
          role: u.role || 'user',
          created_at: u.created_at,
        }));
      }
    }

    // Local simulation
    const local = getLocal<AdminAppUser[]>(LOCAL_USERS_KEY, []);
    let list: AdminAppUser[];
    if (local.length > 0) {
      list = local;
    } else {
      list = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          telegram_id: 100000001,
          name: 'Dr. Selamawit Tena',
          username: 'tena_admin',
          photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
          wallet_balance: 500.00,
          theme: 'light',
          role: 'admin',
          created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          telegram_id: 72819402,
          name: 'Yared Alemu',
          username: 'yared_mindful',
          photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          wallet_balance: 35.00,
          theme: 'light',
          role: 'user',
          created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          telegram_id: 84920194,
          name: 'Sara Kifle',
          username: 'sara_wellness',
          photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          wallet_balance: 12.50,
          theme: 'light',
          role: 'user',
          created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        },
        {
          id: '00000000-0000-0000-0000-000000000004',
          telegram_id: 93847291,
          name: 'Dawit Mengistu',
          username: 'dawit_m',
          photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          wallet_balance: 145.00,
          theme: 'dark',
          role: 'user',
          created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        },
      ];
      setLocal(LOCAL_USERS_KEY, list);
    }

    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter((u) => 
      u.name.toLowerCase().includes(term) || 
      (u.username && u.username.toLowerCase().includes(term)) ||
      u.telegram_id.toString().includes(term)
    );
  },
};

function extractYoutubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}
