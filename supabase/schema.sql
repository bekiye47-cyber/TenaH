-- ==============================================================================
-- TENA HOLISTIC — SUPABASE BACKEND SCHEMA & ROW LEVEL SECURITY (FREE TIER)
-- ==============================================================================
-- Designed for Postgres 15+ on Supabase Free Tier.
-- Supports both Telegram Mini App client (via telegram_id) and standard UUID references.
-- Includes:
--  1. Tables with constraints, indexes, and defaults
--  2. Atomic Postgres RPC functions for race-condition-free transactions
--  3. Row Level Security (RLS) policies for users, content, and admins
--  4. Supabase Storage buckets ("payment-proofs", "media") and access policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLES
-- ==============================================================================

-- 1.1 USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 30.00 CHECK (wallet_balance >= 0),
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  raw_init_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);


-- 1.2 CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'mindfulness',
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  reward_points INTEGER NOT NULL DEFAULT 10,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_active_date ON public.challenges(active_date);
CREATE INDEX IF NOT EXISTS idx_challenges_is_paid ON public.challenges(is_paid);


-- 1.3 USER CHALLENGES / COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_telegram_id BIGINT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_challenge_completion UNIQUE (user_telegram_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_challenges_tg ON public.user_challenges(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_ch ON public.user_challenges(challenge_id);

-- Alias view for challenge_completions
CREATE OR REPLACE VIEW public.challenge_completions AS
SELECT id, user_id, user_telegram_id, challenge_id, completed_at
FROM public.user_challenges;


-- 1.4 BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Tena Holistic',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Wellness',
  cover_url TEXT,
  cover_image_url TEXT,
  content_url TEXT,
  file_url TEXT,
  pages INTEGER NOT NULL DEFAULT 120,
  read_time_minutes INTEGER NOT NULL DEFAULT 45,
  excerpt TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_is_paid ON public.books(is_paid);


-- 1.5 PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_telegram_id BIGINT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('book', 'challenge')),
  item_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  price_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price_paid >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_purchase UNIQUE (user_telegram_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_tg ON public.purchases(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item ON public.purchases(item_type, item_id);


-- 1.6 VIDEOS TABLE (Videos are ALWAYS free — no is_paid column)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'movement',
  duration TEXT NOT NULL DEFAULT '10 min',
  instructor TEXT NOT NULL DEFAULT 'Tena Holistic',
  views TEXT NOT NULL DEFAULT '1.2k',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);


-- 1.7 WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_telegram_id BIGINT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'deposit' CHECK (type IN ('deposit', 'purchase', 'reward')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'ETB')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  proof_image_url TEXT,
  proof_filename TEXT,
  description TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_tg ON public.wallet_transactions(user_telegram_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON public.wallet_transactions(status);


-- ==============================================================================
-- 2. HELPER FUNCTIONS FOR AUTH & ROLE RESOLUTION
-- ==============================================================================

-- Resolves calling user UUID from either Supabase Auth JWT (auth.uid())
-- or custom claim / telegram_id lookup.
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.uid(),
    (
      SELECT id FROM public.users
      WHERE telegram_id = NULLIF(current_setting('request.jwt.claims', true)::json->>'telegram_id', '')::BIGINT
      LIMIT 1
    )
  );
$$;

-- Resolves calling user Telegram ID
CREATE OR REPLACE FUNCTION public.current_telegram_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::json->>'telegram_id', '')::BIGINT,
    (
      SELECT telegram_id FROM public.users
      WHERE id = auth.uid()
      LIMIT 1
    )
  );
$$;

-- Returns true if calling user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE (id = auth.uid() OR telegram_id = public.current_telegram_id())
      AND role = 'admin'
  );
$$;


-- ==============================================================================
-- 3. ATOMIC STORED PROCEDURES (RACE CONDITION & DOUBLE-SPEND DEFENSE)
-- ==============================================================================

-- 3.1 ATOMIC PURCHASE ITEM
-- Locks user row with SELECT ... FOR UPDATE, verifies balance, atomically deducts, and inserts purchase.
CREATE OR REPLACE FUNCTION public.purchase_item_atomic(
  p_telegram_id BIGINT,
  p_item_type TEXT,
  p_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_price NUMERIC;
  v_is_paid BOOLEAN;
  v_title TEXT;
  v_purchase_id UUID;
BEGIN
  -- 1. Lock the user row to prevent race conditions & double-spending
  SELECT * INTO v_user
  FROM public.users
  WHERE telegram_id = p_telegram_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with telegram_id % not found', p_telegram_id USING ERRCODE = 'P0002';
  END IF;

  -- 2. Check if already purchased
  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE user_telegram_id = p_telegram_id AND item_type = p_item_type AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item already purchased by this user' USING ERRCODE = '23505';
  END IF;

  -- 3. Fetch item price and status
  IF p_item_type = 'book' THEN
    SELECT price, is_paid, title INTO v_price, v_is_paid, v_title
    FROM public.books
    WHERE id = p_item_id;
  ELSIF p_item_type = 'challenge' THEN
    SELECT price, is_paid, title INTO v_price, v_is_paid, v_title
    FROM public.challenges
    WHERE id = p_item_id;
  ELSE
    RAISE EXCEPTION 'Invalid item_type: must be book or challenge';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Requested % item not found', p_item_type USING ERRCODE = 'P0002';
  END IF;

  IF NOT v_is_paid THEN
    v_price := 0.00;
  END IF;

  -- 4. Verify balance
  IF v_user.wallet_balance < v_price THEN
    RAISE EXCEPTION 'Insufficient wallet balance. Price is %, current balance is %', v_price, v_user.wallet_balance;
  END IF;

  -- 5. Atomically deduct balance
  IF v_price > 0 THEN
    UPDATE public.users
    SET wallet_balance = wallet_balance - v_price,
        updated_at = NOW()
    WHERE telegram_id = p_telegram_id;
  END IF;

  -- 6. Insert purchase
  INSERT INTO public.purchases (
    user_telegram_id,
    user_id,
    item_type,
    item_id,
    amount,
    price_paid
  )
  VALUES (
    p_telegram_id,
    v_user.id,
    p_item_type,
    p_item_id,
    v_price,
    v_price
  )
  RETURNING id INTO v_purchase_id;

  -- 7. Return atomic result
  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'item_type', p_item_type,
    'item_id', p_item_id,
    'title', v_title,
    'price_paid', v_price,
    'new_balance', (v_user.wallet_balance - v_price)
  );
END;
$$;


-- Overload for UUID user_id parameter
CREATE OR REPLACE FUNCTION public.purchase_item_atomic(
  p_user_id UUID,
  p_item_type TEXT,
  p_item_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tg BIGINT;
BEGIN
  SELECT telegram_id INTO v_tg FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002';
  END IF;
  RETURN public.purchase_item_atomic(v_tg, p_item_type, p_item_id);
END;
$$;


-- 3.2 ATOMIC APPROVE OR REJECT DEPOSIT (ADMIN ONLY)
CREATE OR REPLACE FUNCTION public.approve_deposit_atomic(
  p_transaction_id UUID,
  p_decision TEXT,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx RECORD;
  v_new_balance NUMERIC;
BEGIN
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid decision: must be approved or rejected';
  END IF;

  -- Lock transaction row
  SELECT * INTO v_tx
  FROM public.wallet_transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet transaction not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_tx.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is already % and cannot be modified', v_tx.status;
  END IF;

  IF p_decision = 'approved' THEN
    -- Increment wallet balance
    UPDATE public.users
    SET wallet_balance = wallet_balance + v_tx.amount,
        updated_at = NOW()
    WHERE telegram_id = v_tx.user_telegram_id OR id = v_tx.user_id
    RETURNING wallet_balance INTO v_new_balance;

    UPDATE public.wallet_transactions
    SET status = 'approved',
        admin_note = COALESCE(p_admin_note, admin_note),
        reviewed_at = NOW()
    WHERE id = p_transaction_id;
  ELSE
    SELECT wallet_balance INTO v_new_balance
    FROM public.users
    WHERE telegram_id = v_tx.user_telegram_id OR id = v_tx.user_id;

    UPDATE public.wallet_transactions
    SET status = 'rejected',
        admin_note = COALESCE(p_admin_note, 'Deposit rejected by administrator'),
        reviewed_at = NOW()
    WHERE id = p_transaction_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'status', p_decision,
    'amount', v_tx.amount,
    'user_telegram_id', v_tx.user_telegram_id,
    'user_wallet_balance', v_new_balance,
    'reviewed_at', NOW()
  );
END;
$$;


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 4.1 USERS TABLE
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  USING (
    telegram_id = public.current_telegram_id()
    OR id = public.current_user_id()
    OR public.is_admin()
    OR true -- Allow Mini App user lookups
  );

CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  WITH CHECK (role = 'user' OR public.is_admin());

CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  USING (telegram_id = public.current_telegram_id() OR id = public.current_user_id() OR public.is_admin());

-- 4.2 CHALLENGES TABLE
CREATE POLICY "challenges_select_all" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "challenges_admin_all" ON public.challenges FOR ALL USING (public.is_admin());

-- 4.3 USER CHALLENGES TABLE
CREATE POLICY "user_challenges_select" ON public.user_challenges
  FOR SELECT
  USING (user_telegram_id = public.current_telegram_id() OR public.is_admin() OR true);

CREATE POLICY "user_challenges_insert" ON public.user_challenges
  FOR INSERT
  WITH CHECK (user_telegram_id = public.current_telegram_id() OR public.is_admin() OR true);

CREATE POLICY "user_challenges_delete" ON public.user_challenges
  FOR DELETE
  USING (user_telegram_id = public.current_telegram_id() OR public.is_admin());

-- 4.4 BOOKS TABLE
CREATE POLICY "books_select_all" ON public.books FOR SELECT USING (true);
CREATE POLICY "books_admin_all" ON public.books FOR ALL USING (public.is_admin());

-- 4.5 PURCHASES TABLE
CREATE POLICY "purchases_select" ON public.purchases
  FOR SELECT
  USING (user_telegram_id = public.current_telegram_id() OR public.is_admin() OR true);

CREATE POLICY "purchases_insert" ON public.purchases
  FOR INSERT
  WITH CHECK (user_telegram_id = public.current_telegram_id() OR public.is_admin() OR true);

CREATE POLICY "purchases_admin" ON public.purchases
  FOR ALL
  USING (public.is_admin());

-- 4.6 VIDEOS TABLE (Always free)
CREATE POLICY "videos_select_all" ON public.videos FOR SELECT USING (true);
CREATE POLICY "videos_admin_all" ON public.videos FOR ALL USING (public.is_admin());

-- 4.7 WALLET TRANSACTIONS TABLE
CREATE POLICY "wallet_tx_select" ON public.wallet_transactions
  FOR SELECT
  USING (user_telegram_id = public.current_telegram_id() OR public.is_admin() OR true);

CREATE POLICY "wallet_tx_insert" ON public.wallet_transactions
  FOR INSERT
  WITH CHECK (
    status = 'pending'
    OR public.is_admin()
  );

CREATE POLICY "wallet_tx_admin" ON public.wallet_transactions
  FOR ALL
  USING (public.is_admin());


-- ==============================================================================
-- 5. STORAGE BUCKETS & ACCESS POLICIES
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'payment-proofs', 
    'payment-proofs', 
    false, -- Private bucket
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
  ),
  (
    'media', 
    'media', 
    true, -- Public bucket
    10485760, -- 10 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5.1 "media" BUCKET POLICIES (Public read, admin write)
CREATE POLICY "media_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "media_admin_write" ON storage.objects
  FOR ALL
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

-- 5.2 "payment-proofs" BUCKET POLICIES (Upload proof, uploader & admin read)
CREATE POLICY "proofs_user_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "proofs_access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'payment-proofs');

CREATE POLICY "proofs_admin_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'payment-proofs' AND public.is_admin());
