# ✅ Environment Setup Verification Checklist

Complete this checklist to ensure all APIs are connected and working properly.

## 1. 🔐 Clerk Authentication Setup

### Get API Keys
- [ ] Go to https://dashboard.clerk.com
- [ ] Select your app
- [ ] Copy from **API Keys** section:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Public)
  - `CLERK_SECRET_KEY` (Secret)

### Configure Redirect URLs
- [ ] Sign in → **Applications** → Your App
- [ ] Go to **Authenticated pages** or **Authorized redirect URIs**
- [ ] Add: `http://localhost:3000/dashboard` (development)
- [ ] Add: `http://localhost:3000/onboarding` (development)
- [ ] Add your production domain for deploy

### Verify in .env.local
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Test
```bash
npm run dev
# 1. Go to http://localhost:3000
# 2. Click "Sign Up"
# 3. Create account
# 4. Should redirect to /onboarding
# ✅ Clerk is working if you see onboarding page
```

---

## 2. 🗄️ Supabase Database Setup

### Get API Keys
- [ ] Go to https://supabase.com/dashboard
- [ ] Select your project
- [ ] Go to **Settings** → **API**
- [ ] Copy:
  - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon key under "Project API keys")
  - `SUPABASE_SERVICE_ROLE_KEY` (Service role key under "Project API keys")

### Setup Database Schema
- [ ] Go to **SQL Editor** in Supabase dashboard
- [ ] Click **New Query**
- [ ] Copy-paste entire contents of `supabase-schema.sql` from project root
- [ ] Click **Run** button
- [ ] You should see: "Success. No rows returned"

### Verify Tables Created
- [ ] Go to **Table Editor** in left sidebar
- [ ] Should see these tables:
  - [ ] `users`
  - [ ] `habits`
  - [ ] `habit_completions`
  - [ ] `ai_coach_messages`
  - [ ] `badges`
  - [ ] `mood_checkins`
  - [ ] `voice_dumps`
  - [ ] `mental_health_shields`

### Enable Row Level Security (RLS)
- [ ] For each table, go to **RLS** button and ensure RLS is enabled
- [ ] Existing policies should be visible:
  - `select_own_data`
  - `insert_own_data`
  - `update_own_data`

### Verify in .env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
```

### Test
```bash
npm run dev
# 1. Sign in (uses Clerk from step 1)
# 2. Go to /dashboard
# 3. Click "Add Habit"
# 4. Add a habit and save
# ✅ Supabase is working if habit appears in dashboard
```

---

## 3. 🤖 Google Gemini API Setup (AI Coach + Analytics)

### Get API Key
- [ ] Go to https://makersuite.google.com/app/apikey
- [ ] Click **Create API Key**
- [ ] Select your project (or create new)
- [ ] Copy the API key

### Enable Gemini API
- [ ] Go to https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
- [ ] Click **Enable** button (if not already enabled)

### Verify in .env.local
```bash
GEMINI_API_KEY=AIzaSyAVzqvy7cxZJVDoXxQUTFR3xwXjffC09qs
```

### Test AI Coach
```bash
npm run dev
# 1. Sign in and navigate to /dashboard
# 2. Scroll down to "AI Coach" panel
# 3. Type a message like "I'm struggling with morning routine"
# 4. Wait for response (should stream word-by-word)
# ✅ Gemini is working if you see a coaching response
```

---

## 4. 🎙️ OpenAI API Setup (Voice Transcription)

### Get API Key
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Click **Create new secret key**
- [ ] Copy the key (you won't see it again!)
- [ ] Save it securely

### Set Up Billing
- [ ] Go to https://platform.openai.com/account/billing/overview
- [ ] Add payment method (even for free tier, for rate limits)
- [ ] Set usage limits if desired

### Verify in .env.local
```bash
OPENAI_API_KEY=sk-proj-...
```

### Test Voice Journaling
```bash
npm run dev
# 1. Sign in and navigate to /dashboard
# 2. Look for "Voice Journal" or microphone icon
# 3. Click to record (allow microphone permission)
# 4. Record a short message (5-10 seconds)
# 5. Wait for transcription
# ✅ OpenAI is working if you see transcribed text
```

---

## 5. 💳 Stripe Setup (Optional - Pro Subscriptions)

### Create Stripe Account
- [ ] Go to https://stripe.com
- [ ] Click **Start now**
- [ ] Complete account setup

### Get API Keys
- [ ] Go to https://dashboard.stripe.com/apikeys
- [ ] You should see **Publishable key** and **Secret key**
- [ ] Copy both (make sure you're in test mode)

### Create Product & Price
- [ ] Go to https://dashboard.stripe.com/products
- [ ] Click **Add product**
- [ ] Name: "Healthy Buddy Pro"
- [ ] Description: "Unlimited habits, advanced analytics"
- [ ] Add pricing (e.g., $9.99/month)
- [ ] Copy the **Price ID** (looks like `price_xxx`)

### Setup Webhook
**For Development (Local Testing):**
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Will output webhook signing secret
```

**For Production:**
- [ ] Go to https://dashboard.stripe.com/webhooks
- [ ] Click **Add endpoint**
- [ ] URL: `https://your-domain.com/api/stripe/webhook`
- [ ] Events to send: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Verify in .env.local
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### Test Stripe
```bash
npm run dev
# 1. Go to /upgrade page
# 2. Click "Upgrade to Pro"
# 3. Should redirect to Stripe checkout
# ✅ Stripe is working if checkout loads
```

---

## 6. Quick Verification Test (All APIs)

Run this after completing all 5 sections:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run checks
npm run db:generate  # Verify Supabase connection

# Then in browser:
# 1. Sign up (Clerk) → Should redirect to /onboarding
# 2. Create first habit → Should appear in dashboard (Supabase)
# 3. Ask AI Coach a question → Should get streaming response (Gemini)
# 4. Record voice message → Should see transcript (OpenAI)
# 5. Check mood display → Should show energy/mood sliders (Supabase)
```

---

## 7. Environment Variables Summary

### Frontend-Accessible (public)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
```

### Server-Only (secret)
```bash
CLERK_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
```

---

## Common Issues & Solutions

### "Unauthorized" error when signing in
- ❌ Problem: Clerk keys not set correctly
- ✅ Solution: Double-check `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Habits not saving
- ❌ Problem: Supabase connection issue
- ✅ Solution: Verify `SUPABASE_SERVICE_ROLE_KEY` and check RLS policies

### AI Coach returns error
- ❌ Problem: Gemini API key invalid
- ✅ Solution: Regenerate key at https://makersuite.google.com/app/apikey

### Voice transcription fails
- ❌ Problem: OpenAI API key missing or invalid
- ✅ Solution: Check API key at https://platform.openai.com/api-keys

### Modal sizing issues
- ❌ Problem: Responsive layout not working
- ✅ Solution: Ensure browser zoom is at 100% and viewport is set correctly

---

## Next Steps

1. ✅ Complete all sections above
2. ✅ Test each feature
3. ✅ Deploy to Vercel (or your hosting)
4. ⚠️ Update environment variables in production
5. 📱 Welcome to the Healthy Buddy ecosystem!
