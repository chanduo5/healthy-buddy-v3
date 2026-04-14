# 🚀 Healthy Buddy v3.0 — Complete Setup Guide

Follow these steps **in order** to get the enhanced Healthy Buddy app running with all new features including AI-powered voice journaling, mood tracking, mental health shields, and cognitive load balancing.

---

## ✅ Prerequisites

- Node.js 18+ installed → check with `node -v`
- A free account on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Anthropic](https://console.anthropic.com), [OpenAI](https://platform.openai.com)

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

### 🎙️ OpenAI (Voice Journaling & Analysis)

1. Go to [platform.openai.com](https://platform.openai.com) → **API Keys**
2. Click **Create new secret key**, name it "Healthy Buddy Voice"
3. Copy the key (starts with `sk-...`)
4. Set `OPENAI_API_KEY=sk-...`

### 🧠 Google Gemini (Voice Analysis)

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key for "Healthy Buddy"
3. Copy the key
4. Set `GEMINI_API_KEY=your-gemini-api-key`

> **Note:** Voice journaling requires both OpenAI (Whisper) and Gemini API keys. Mood tracking and mental health shields work without these.

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

> **Important:** The updated schema includes new tables for mood check-ins, voice dumps, mental health shields, and the mental_strain column for habits.

---

## Step 4 — Database Migrations (New Features)

After running the main schema, run these additional migrations:

### Add Mental Strain to Habits
```sql
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS mental_strain TEXT DEFAULT 'medium' CHECK (mental_strain IN ('low','medium','high'));
```

### Create Mood Check-ins Table
```sql
CREATE TABLE public.mood_checkins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  energy_level  INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  mood_level    INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 10),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### Create Voice Dumps Table
```sql
CREATE TABLE public.voice_dumps (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transcript    TEXT NOT NULL,
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score BETWEEN -1 AND 1),
  stress_score  INTEGER CHECK (stress_score BETWEEN 0 AND 100),
  ai_insights   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Create Mental Health Shields Table
```sql
CREATE TABLE public.mental_health_shields (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activated_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  reason        TEXT,
  xp_cost       INTEGER NOT NULL DEFAULT 100,
  UNIQUE(user_id, activated_at)
);
```

---

## Step 5 — Start the app

```bash
npm run dev
```

Open your browser at **http://localhost:3000**

You should see the landing page. Click **Get Started** to create an account.

---

## 🎯 New Features Setup Verification

After setup, test these new features:

### ✅ Energy & Mood Check-in
- Log in to the dashboard
- A mood check-in modal should appear automatically
- Rate your energy (1-10) and mood (1-10)

### ✅ Voice Journaling
- On the dashboard, click the microphone button (🎙️)
- Allow microphone access
- Record up to 60 seconds of voice
- AI will transcribe and analyze your mood

### ✅ Mental Health Shield
- Click the shield button (🛡️) on the dashboard
- Spend 100 XP to protect your streaks for 24 hours

### ✅ Cognitive Load Balancing
- Create a new habit
- Select mental strain level (Low/Medium/High)
- See strain badges on habit cards

### ✅ Enhanced AI Coach
- The AI now considers your mood and mental strain
- Get personalized suggestions based on your energy levels

---

## 🔧 Troubleshooting

### Voice Recording Not Working
- Ensure `OPENAI_API_KEY` and `GEMINI_API_KEY` are set
- Check browser microphone permissions
- Try in a secure context (HTTPS or localhost)

### Mood Check-in Not Appearing
- Clear localStorage: `localStorage.clear()` in browser console
- Check that `mood_checkins` table exists in Supabase

### Mental Health Shield Errors
- Ensure you have at least 100 XP
- Check `mental_health_shields` table permissions

### Database Errors
- Verify all tables were created successfully
- Check Supabase logs for detailed error messages

---

## 📱 Production Deployment

When ready for production:

1. **Environment Variables**: Set all production API keys
2. **Database**: Run the schema on your production Supabase instance
3. **Build**: `npm run build`
4. **Deploy**: Use Vercel, Netlify, or your preferred platform

---

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Supabase tables exist and have correct permissions
4. Test API endpoints individually

Happy habit tracking! 🌱✨

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
