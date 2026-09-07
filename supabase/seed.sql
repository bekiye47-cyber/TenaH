-- ==============================================================================
-- TENA HOLISTIC — SAMPLE SEED DATA (/supabase/seed.sql)
-- ==============================================================================

-- 1. SEED USERS (Admin + Regular User)
INSERT INTO public.users (id, telegram_id, name, first_name, last_name, username, photo_url, wallet_balance, theme, theme_preference, role)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    100000001,
    'Dr. Selamawit Tena',
    'Dr. Selamawit',
    'Tena',
    'tena_admin',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    500.00,
    'light',
    'light',
    'admin'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    100000002,
    'Yared Alemu',
    'Yared',
    'Alemu',
    'yared_mindful',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    35.00,
    'light',
    'light',
    'user'
  )
ON CONFLICT (telegram_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  wallet_balance = EXCLUDED.wallet_balance;

-- 2. SEED CHALLENGES (Free + Premium)
INSERT INTO public.challenges (id, title, description, category, duration_minutes, reward_points, is_paid, price, active_date)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Morning Diaphragmatic Breathwork',
    'Perform 5 minutes of 4-7-8 parasympathetic calming breathing right after waking up.',
    'breathwork',
    5,
    15,
    false,
    0.00,
    CURRENT_DATE
  ),
  (
    '11111111-1111-1111-1111-111111111112',
    'Hydration & Himalayan Mineral Flush',
    'Drink 500ml of body-temperature mineral water with a pinch of Celtic or Himalayan pink salt.',
    'nutrition',
    3,
    10,
    false,
    0.00,
    CURRENT_DATE
  ),
  (
    '11111111-1111-1111-1111-111111111113',
    'Clinical 3-Day Gut Reset Protocol',
    'Advanced practitioner-guided metabolic reset protocol supervised by holistic naturopaths.',
    'nutrition',
    20,
    50,
    true,
    5.00,
    CURRENT_DATE
  )
ON CONFLICT (id) DO NOTHING;

-- 3. SEED BOOKS
INSERT INTO public.books (id, title, author, description, category, cover_url, cover_image_url, content_url, file_url, pages, read_time_minutes, is_paid, price)
VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    'The Circadian Code of the Horn',
    'Dr. Selamawit Tena',
    'Aligning natural biological rhythms with indigenous Ethiopian nutritional cycles.',
    'Circadian Rhythm',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    'https://example.com/books/circadian-code.pdf',
    'https://example.com/books/circadian-code.pdf',
    140,
    55,
    false,
    0.00
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Traditional Ethiopian Herbal Pharmacopeia',
    'Holistic Botanicals Institute',
    'A comprehensive guide to indigenous botanical herbs, infusions, and nervous system restorative teas.',
    'Herbal Medicine',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    'https://example.com/books/ethiopian-herbal.pdf',
    'https://example.com/books/ethiopian-herbal.pdf',
    210,
    90,
    true,
    8.50
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Mindful Fasting and Autophagy Handbook',
    'Dr. Selamawit Tena',
    'Scientific frameworks on intermittent fasting, cellular cleansing, and cellular repair.',
    'Fasting & Longevity',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    'https://example.com/books/fasting-autophagy.pdf',
    'https://example.com/books/fasting-autophagy.pdf',
    180,
    75,
    true,
    12.00
  )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED VIDEOS (Always free)
INSERT INTO public.videos (id, title, youtube_url, youtube_id, thumbnail_url, category, duration, instructor, views)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    '10-Minute Morning Yoga for Spine & Nervous System',
    'https://www.youtube.com/watch?v=sTANio_2E0Q',
    'sTANio_2E0Q',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    'movement',
    '10 min',
    'Sara K.',
    '3.4k'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Vagus Nerve Stimulation: 3 Quick Drills for Calm',
    'https://www.youtube.com/watch?v=L1HCG3BgK8I',
    'L1HCG3BgK8I',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    'breathwork',
    '7 min',
    'Dr. Selamawit',
    '8.9k'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Foods That Repair Your Microbiome and Gut Barrier',
    'https://www.youtube.com/watch?v=1uPn_jF9h3w',
    '1uPn_jF9h3w',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600',
    'nutrition',
    '15 min',
    'Dr. Selamawit',
    '12.1k'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SAMPLE PENDING DEPOSIT TRANSACTION
INSERT INTO public.wallet_transactions (id, user_telegram_id, type, amount, currency, status, proof_url, proof_filename, description, admin_note)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    100000002,
    'deposit',
    50.00,
    'USD',
    'pending',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    'receipt_telebirr.png',
    'Wallet top-up via Telebirr transfer',
    'Awaiting administrative verification'
  )
ON CONFLICT (id) DO NOTHING;
