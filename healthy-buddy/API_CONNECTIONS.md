# 🔗 API Connections Map

This document maps environment variables to API routes and components that use them.

## Environment Variables → Features

### 🔐 CLERK Authentication
**Environment Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public)
- `CLERK_SECRET_KEY` (server-only)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/auth/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/auth/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/onboarding`

**Used By:**
- `middleware.ts` - Route protection
- `app/auth/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `app/auth/sign-up/[[...sign-up]]/page.tsx` - Sign-up page
- All API routes via `auth()` from `@clerk/nextjs/server`
- Components via `useAuth()` hook

---

### 🗄️ SUPABASE Database
**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` (public, for client operations)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, limited permissions)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, full permissions)

**Used By:**
- `lib/supabase/client.ts` - Browser client (habits, analytics)
- `lib/supabase/server.ts` - Server client (API routes with admin access)
- **API Routes:**
  - `app/api/habits/route.ts` - CRUD habits
  - `app/api/habits/[id]/route.ts` - Individual habit management
  - `app/api/habits/[id]/complete/route.ts` - Mark habit complete + save XP
  - `app/api/habits/heatmap/route.ts` - Get 365-day activity data
  - `app/api/ai-coach/route.ts` - Save/load conversation history
  - `app/api/mood-checkin/route.ts` - Save mood & energy data
  - `app/api/mood-checkin/latest/route.ts` - Fetch recent mood data
  - `app/api/voice-dump/route.ts` - Save transcripts & analysis
  - `app/api/mental-health-shield/route.ts` - Create/activate shields
  - `app/api/badges/route.ts` - Award badges on milestone
  - `app/api/auth/me/route.ts` - Get current user profile

---

### 🤖 GOOGLE GEMINI API
**Environment Variable:**
- `GEMINI_API_KEY` (server-only)

**Used By:**
1. **AI Coach** (`app/api/ai-coach/route.ts`)
   - Model: `gemini-2.5-flash`
   - Features: Real-time streaming habit coaching with mood awareness
   - Input: User message + conversation history
   - Output: Streaming SSE responses for frontend

2. **Voice Dump Analysis** (`app/api/voice-dump/route.ts`)
   - Model: `gemini-2.5-flash`
   - Features: Sentiment & stress analysis on voice transcripts
   - Input: Voice transcript (from OpenAI Whisper)
   - Output: Sentiment score (-1 to 1), Stress score (0-100), Insights

**Data Flow:**
```
User Message → GEMINI → AI Coach Response
Voice Audio → OPENAI → Transcript → GEMINI → Analysis
```

---

### 🎙️ OPENAI API
**Environment Variable:**
- `OPENAI_API_KEY` (server-only)

**Used By:**
1. **Voice-to-Text Transcription** (`app/api/voice-dump/route.ts`)
   - Model: `whisper-1`
   - Features: Convert audio to text with language detection
   - Input: Audio file (webm format)
   - Output: Transcript text

**Data Flow:**
```
User Voice Recording → OPENAI WHISPER → Transcript Text
                                         ↓
                        GEMINI Sentiment Analysis
                                         ↓
                        Save to Supabase + Return to Frontend
```

---

### 💳 STRIPE Payments
**Environment Variables:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (public)
- `STRIPE_SECRET_KEY` (server-only)
- `STRIPE_WEBHOOK_SECRET` (server-only)
- `STRIPE_PRO_PRICE_ID` (product ID, server & client)

**Used By:**
1. **Checkout Creation** (`app/api/stripe/create-checkout/route.ts`)
   - Creates checkout session for Pro subscription
   - Input: User ID, return URLs
   - Output: Checkout session URL

2. **Webhook Handler** (`app/api/stripe/webhook/route.ts`)
   - Listens for payment events (payment_intent.succeeded)
   - Updates user subscription status in Supabase
   - Input: Stripe webhook event
   - Output: Updates user.subscription_status in DB

**Data Flow:**
```
User Clicks "Upgrade" 
    ↓
Create Checkout Session (Stripe)
    ↓
User completes payment on Stripe
    ↓
Stripe sends webhook event
    ↓
Update user.subscription_status in Supabase
```

---

## Complete Request Flow Examples

### Example 1: Complete a Habit
```
1. Frontend: User clicks "Complete" on HabitCard
   ↓
2. useHabits.ts: Calls /api/habits/[id]/complete
   ↓
3. API Route: Uses CLERK (auth) + SUPABASE (save completion)
   ↓
4. Database: Deduct mental strain, grant XP, check badges
   ↓
5. Frontend: Animation plays, XP updates
```

### Example 2: Voice Journal Entry
```
1. Frontend: User records voice in VoiceDumpModal
   ↓
2. API Route /api/voice-dump: Upload audio file
   ↓
3. OPENAI: Transcribe audio (OPENAI_API_KEY)
   ↓
4. GEMINI: Analyze sentiment (GEMINI_API_KEY)
   ↓
5. SUPABASE: Save transcript + analysis
   ↓
6. Frontend: Display insights + add to dashboard
```

### Example 3: AI Coach Interaction
```
1. Frontend: User sends message to AiCoachPanel
   ↓
2. API Route /api/ai-coach: Process user message
   ↓
3. SUPABASE: Load conversation history
   ↓
4. GEMINI: Generate streaming response
   ↓
5. Frontend: Render streaming text in real-time
   ↓
6. SUPABASE: Save conversation to history
```

---

## Testing Checklist

- [ ] **Clerk**: Sign up/sign in works, user redirects to dashboard
- [ ] **Supabase**: Can create habits, see them update in real-time
- [ ] **Gemini AI Coach**: Ask coach a question, gets streaming response
- [ ] **OpenAI Voice**: Record a voice memo, transcript appears
- [ ] **Gemini Sentiment**: Voice memo shows sentiment score & insights
- [ ] **Stripe**: Pro upgrade button works, redirects to checkout
- [ ] **Mood Check-in**: Can submit mood, see it affect AI suggestions
- [ ] **Mental Health Shield**: Can activate with XP cost
- [ ] **XP & Badges**: Habit completions award XP and unlock badges

---

## Environment Variable Checklist for `.env.local`

```bash
# ✅ REQUIRED FOR CORE FEATURES
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=required
CLERK_SECRET_KEY=required
NEXT_PUBLIC_SUPABASE_URL=required
NEXT_PUBLIC_SUPABASE_ANON_KEY=required
SUPABASE_SERVICE_ROLE_KEY=required

# ✅ REQUIRED FOR AI FEATURES (using Google APIs as default)
GEMINI_API_KEY=required (for AI Coach + Voice Analysis)
OPENAI_API_KEY=required (for Voice Transcription)

# ⚠️ OPTIONAL (for Pro tier features)
STRIPE_SECRET_KEY=optional (if not using premium)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=optional
STRIPE_WEBHOOK_SECRET=optional
STRIPE_PRO_PRICE_ID=optional

# ℹ️ CONFIGURATION
NEXT_PUBLIC_APP_URL=http://localhost:3000 (production: your domain)
```
