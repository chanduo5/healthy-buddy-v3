# 🚀 Healthy Buddy — Local Setup Guide

Follow these steps **in order** to get the app running on localhost.

---

## ✅ Prerequisites

- Node.js 18+ installed → check with `node -v`
- A free account on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Anthropic](https://console.anthropic.com)

---

## Step 1 — Install dependencies

```bash
cd healthy-buddy
npm install --legacy-peer-deps
```

---

## Step 2 — Create .env.local

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in each value:

### 🔐 Clerk (Authentication)

1. Go to [clerk.com](https://clerk.com) → **Create application**
2. Name it "Healthy Buddy", enable **Google + Email** sign-in
3. Go to **API Keys** tab
4. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_...`
   - `CLERK_SECRET_KEY` = `sk_test_...`

In Clerk → **Redirects** settings, set:
| Setting | Value |
|---|---|
| Sign-in URL | `/auth/sign-in` |
| Sign-up URL | `/auth/sign-up` |
| After sign-in | `/dashboard` |
| After sign-up | `/onboarding` |

### 🗄️ Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a region close to you, set a strong DB password
3. Wait ~2 min for it to spin up
4. Go to **Project Settings → API**
5. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (service_role key — keep secret!)

### 🤖 Anthropic (AI Coach)

1. Go to [console.anthropic.com](https://console.anthropic.com) → **API Keys**
2. Click **Create Key**, name it "Healthy Buddy Dev"
3. Copy the key (starts with `sk-ant-...`)
4. Set `ANTHROPIC_API_KEY=sk-ant-...`

> **Note:** The AI Coach only works with a valid API key. Without it, other features still work fine.

### 💳 Stripe (Optional — for Pro plan)

Skip this for local testing. The app works fully on Free plan.

If you want Stripe:
1. Go to [stripe.com](https://stripe.com) → Dashboard (test mode)
2. Copy publishable + secret keys
3. Create a recurring price and copy the price ID

---

## Step 3 — Set up the database

1. Open your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open `supabase-schema.sql` from this project
5. Paste the entire contents and click **Run**
6. You should see "Success. No rows returned"

---

## Step 4 — Start the app

```bash
npm run dev
```

Open your browser at **http://localhost:3000**

You should see the landing page. Click **Get Started** to create an account.

---

## 🐛 Troubleshooting

### "Unauthorized" errors in the console
→ Check your Clerk keys in `.env.local` are correct (no extra spaces)
→ Make sure Clerk redirect URLs are set correctly

### "Could not find user" / habits not loading
→ Make sure you ran `supabase-schema.sql` in full
→ Check your `SUPABASE_SERVICE_ROLE_KEY` is the service_role key (not anon)

### AI Coach says "check your API key"
→ Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local`
→ Restart the dev server after changing env vars: `Ctrl+C` then `npm run dev`

### Drag and drop not working
→ It requires JavaScript to fully load. Wait 1-2 seconds after page load.

### Changes to .env.local not taking effect
→ Always restart the dev server: `Ctrl+C` → `npm run dev`

---

## 📁 Key files reference

| File | What it does |
|---|---|
| `.env.local` | Your secret keys (never commit this!) |
| `supabase-schema.sql` | Run once in Supabase SQL editor |
| `app/dashboard/page.tsx` | Main dashboard |
| `app/api/habits/route.ts` | Habit CRUD API |
| `app/api/ai-coach/route.ts` | Claude streaming API |
| `lib/theme.tsx` | Theme system (colors, glass, fonts) |
| `components/ui/ThemeSettingsPanel.tsx` | Appearance panel |

---

## 🎨 Customizing the Theme

Click **"Theme"** in the top-right or sidebar **"Appearance"** button to open the theme panel. Changes save to `localStorage` instantly — no restart needed.

| Option | Choices |
|---|---|
| Accent color | Forest (green), Ocean (blue), Nebula (purple), Ember (orange), Sakura (pink), Electric (cyan) |
| Background | Midnight, Dark (default), Ember warm |
| Glass intensity | Minimal, Glass (default), Frosted |
| Font | Jakarta (default), Grotesk, Mono |

---

**Happy building! 🌿**
