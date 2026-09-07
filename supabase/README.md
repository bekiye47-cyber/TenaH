# Tena Holistic — Supabase Backend Guide (100% Free Tier)

This folder contains the complete, production-ready backend for the **Tena Holistic** Telegram Mini App using Supabase's free tier.

## Architecture Overview

- **Database**: PostgreSQL with Row Level Security (RLS) on every table.
- **Storage**:
  - `media`: Public bucket for thumbnails, book covers, and videos.
  - `payment-proofs`: Private bucket restricted to the uploader and administrators.
- **Atomic Operations**: PostgreSQL stored procedures (`purchase_item_atomic` and `approve_deposit_atomic`) using `SELECT ... FOR UPDATE` row locks to prevent race conditions and double-spending.
- **Edge Functions** (Deno/TypeScript):
  - `verify-telegram-init`: Official Telegram HMAC-SHA256 signature verification.
  - `purchase-item`: Atomic wallet deduction and purchase logger.
  - `approve-deposit`: Admin-only transaction approval and balance credit.

---

## 1. Step-by-Step Deployment with Supabase CLI

### Step 1.1: Install the Supabase CLI
```bash
# macOS / Linux via Homebrew
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### Step 1.2: Login and Link Your Supabase Project
1. Log in to your Supabase account:
   ```bash
   supabase login
   ```
2. Link to your project using your Project Reference ID (found in Project Settings > General):
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Step 1.3: Apply Database Schema & Migrations
You can apply the schema either through the CLI or via the Supabase Dashboard:

**Via CLI:**
```bash
supabase db push
```

**Via Supabase Dashboard:**
1. Open your Supabase project dashboard.
2. Go to the **SQL Editor** (left menu).
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. (Optional) Paste and run `supabase/seed.sql` to populate sample data.

---

## 2. Set Up Edge Function Secrets

Telegram Mini App verification requires your Telegram Bot Token from [@BotFather](https://t.me/botfather).

Run this command in your terminal:
```bash
supabase secrets set TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

Optional admin secret for server-to-server approval calls:
```bash
supabase secrets set ADMIN_SECRET="your_custom_secure_admin_passphrase"
```

You can verify secrets are set by running:
```bash
supabase secrets list
```

---

## 3. Deploy Edge Functions

Deploy each function with a single command (no Docker required):

```bash
# Deploy verify-telegram-init
supabase functions deploy verify-telegram-init --no-verify-jwt

# Deploy purchase-item
supabase functions deploy purchase-item

# Deploy approve-deposit
supabase functions deploy approve-deposit
```

> **Note on `--no-verify-jwt`**: `verify-telegram-init` handles its own cryptographic HMAC validation directly from the Telegram WebApp header/payload, so Supabase's built-in JWT check is bypassed for that entry point.

---

## 4. Connecting the Mini App Frontend

In your app's `.env` or project settings:
```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

All functions are immediately callable from the frontend:
```ts
// Example: Verifying Telegram User on startup
const { data, error } = await supabase.functions.invoke('verify-telegram-init', {
  body: { initData: window.Telegram.WebApp.initData }
});
```
