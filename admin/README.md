# Tena Holistic — Admin Portal

Standalone, secure web application for administrators of the **Tena Holistic** Telegram Mini App backend.

Built strictly on a **100% Free Stack**:
- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase JS Client** + **Supabase Auth** (Free Tier email/password)
- **Supabase Storage** ("media" public bucket for covers and thumbnails)
- **Edge Functions** (`approve-deposit` RPC integration)

---

## 🚀 Quick Start (Local Development)

1. Navigate to the admin folder or root:
```bash
cd admin
npm install
npm run dev
```
The admin portal will boot locally at `http://localhost:3001`.

2. Environment Configuration:
Create a `.env` file inside `admin/` (or project root):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

## 🔐 Creating Your First Admin Account

1. Open the Admin Login screen and click **"Register New User"**.
2. Enter your email (e.g. `admin@tenaholistic.com`) and choose a strong password.
3. Once registered, log in to your [Supabase Dashboard](https://supabase.com/dashboard):
   - Open **Table Editor** > table **`users`**.
   - Locate your newly registered user row.
   - Edit the **`role`** column: change from `'user'` to `'admin'`.
   - Save the row.
4. Return to the Admin Login screen and sign in. You now have full administrator access!

*(Note: If a user without `role = 'admin'` attempts to sign in, access is denied immediately and they are automatically logged out).*

---

## 🌐 Free Deployments

### Option A: Deploy to Vercel (Free Tier)
1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project**.
3. Set **Root Directory** to `admin`.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
5. Click **Deploy**. Vercel will automatically use `vercel.json` and build the app!

### Option B: Deploy to Netlify (Free Tier)
1. In [Netlify Dashboard](https://app.netlify.com), click **Add new site** > **Import an existing project**.
2. Set **Base directory** to `admin`.
3. Build command: `npm run build`
4. Publish directory: `admin/dist`
5. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
6. Click **Deploy site**.

---

## 📋 Features Included

1. **Challenges**:
   - Table list (title, active date, tier, price).
   - "Add new" and "Edit" modal with Free/Paid toggle (price field is conditionally hidden/disabled if Free).
   - Confirm-before-delete modal.

2. **Books**:
   - Table list with cover thumbnail, title, author, tier, and price.
   - "Add new" modal with image upload directly to the Supabase `"media"` bucket.
   - PDF/content link input.
   - Confirm-before-delete modal.

3. **Videos**:
   - Free video directory for movement, breathwork, and nutrition.
   - Automatic YouTube thumbnail extraction from URL or custom image upload.
   - Always free (no pricing toggle).

4. **Deposits & Wallet Approvals**:
   - Filters: Pending (default) / Approved / Rejected / All.
   - Shows user's name, Telegram photo, amount requested, and clickable payment proof screenshot (with zoom modal).
   - "Approve" and "Reject" buttons with audit note dialog calling the atomic `approve-deposit` Edge Function and updating user wallet balances instantly.

5. **Users**:
   - Read-only table of Telegram Mini App profiles.
   - Real-time search by name, username, or Telegram ID.
   - Displays current wallet balances and join dates.
