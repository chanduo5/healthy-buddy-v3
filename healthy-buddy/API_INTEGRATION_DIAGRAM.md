# 📊 Complete API Integration Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  🌐 HEALTHY BUDDY - Full API Integration Map                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


                              FRONTEND (Next.js 14)
                         ┌──────────────────────────────┐
                         │    React Components          │
                         │   ✓ HabitCard               │
                         │   ✓ AiCoachPanel            │
                         │   ✓ VoiceDumpModal          │
                         │   ✓ EnergyMoodCheckin       │
                         │   ✓ MentalHealthShield      │
                         └──────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │  Hooks   │    │ useAuth()│    │Zustand   │
              │useHabits │    │Clerk     │    │Store     │
              └──────────┘    └──────────┘    └──────────┘
                    │
                    └───────────────┬───────────────┐
                                    │               │
                    ┌───────────────┼────────┐      │
                    ▼               ▼        ▼      ▼
            ┌─────────────────────────────────────────────────────┐
            │         NEXT.JS API ROUTES (App Router)            │
            │                                                     │
            │  POST /api/habits/[id]/complete                   │
            │  POST /api/ai-coach                               │
            │  POST /api/voice-dump                             │
            │  POST /api/mood-checkin                           │
            │  POST /api/mental-health-shield                  │
            │  POST /api/stripe/create-checkout                │
            │  POST /api/stripe/webhook                        │
            │                                                     │
            └─────────────────────────────────────────────────────┘
                    │            │            │            │
            ┌───────┴────┐   ┌────┴────┐   ┌─┴────┐   ┌───┴────┐
            │            │   │         │   │      │   │        │
            ▼            ▼   ▼         ▼   ▼      ▼   ▼        ▼
        ┌────────┐   ┌────────┐   ┌────────┐   ┌──────────┐  ┌────────┐
        │ Clerk  │   │Supabase│   │ Gemini │   │ OpenAI   │  │ Stripe │
        │ Auth   │   │        │   │ 2.5    │   │ Whisper  │  │        │
        │        │   │        │   │ Flash  │   │ + API    │  │        │
        └────────┘   └────────┘   └────────┘   └──────────┘  └────────┘
            │            │            │            │             │
       Secret                  Secret          Secret         Secret
       Env Vars:         Env Vars:      Env Vars:         Env Vars:


CLERK_SECRET_KEY        SUPABASE_          GEMINI_         OPENAI_
NEXT_PUBLIC_            SERVICE_ROLE_KEY   API_KEY         API_KEY
CLERK_PUBLISHABLE_ + NEXT_PUBLIC_                         STRIPE_
KEY + URLS             SUPABASE_URL +                      SECRET_
                       ANON_KEY                            KEY +
                                                           WEBHOOK_SECRET


DATABASE TABLES             AI MODELS                  VOICE PIPELINE
┌──────────────────┐       ┌────────────────┐        ┌──────────────┐
│ users            │       │ Claude Model?  │        │ Audio Input  │
│ habits           │       │ (Optional)     │        │      ▼       │
│ habit_completions│       │                │        │  Whisper     │
│ ai_coach_messages│       │ Gemini 2.5 ✓   │        │  Transcribe  │
│ mood_checkins    │       │ (Default AI)   │        │      ▼       │
│ voice_dumps      │       │                │        │  Gemini      │
│ badges           │       │  Model: Streaming       │  Sentiment   │
│ mental_health_   │       │  Responses               │      ▼       │
│ shields          │       │  (Server-Sent Events)   │  Save to DB  │
│ subscriptions    │       └────────────────┘        └──────────────┘
└──────────────────┘
```

---

## API Routes & Their Connections

### Route 1: Complete Habit
```
POST /api/habits/[id]/complete
│
├─ Security:
│  └─ CLERK_SECRET_KEY (auth verification)
│
├─ Data Operations:
│  └─ SUPABASE_SERVICE_ROLE_KEY (save completion)
│
└─ Response:
   └─ XP awarded, level up, badges
```

### Route 2: AI Coach (Streaming)
```
POST /api/ai-coach
│
├─ Security:
│  └─ CLERK_SECRET_KEY
│
├─ Data:
│  ├─ SUPABASE_SERVICE_ROLE_KEY (load history)
│  └─ NEXT_PUBLIC_SUPABASE_URL (load async)
│
├─ AI Processing:
│  └─ GEMINI_API_KEY (streaming response)
│
├─ Storage:
│  └─ SUPABASE_SERVICE_ROLE_KEY (save conversation)
│
└─ Output:
   └─ Server-Sent Events (streaming text)
```

### Route 3: Voice Journaling
```
POST /api/voice-dump
│
├─ Security:
│  └─ CLERK_SECRET_KEY
│
├─ Speech-to-Text:
│  └─ OPENAI_API_KEY (Whisper model)
│     Input: Audio file
│     Output: Transcript
│
├─ Sentiment Analysis:
│  └─ GEMINI_API_KEY (Sentiment + Stress)
│     Input: Transcript
│     Output: {"sentiment": -0.5, "stress": 65, "insights": "..."}
│
├─ Storage:
│  └─ SUPABASE_SERVICE_ROLE_KEY (save analysis)
│
└─ Response:
   └─ Transcript + Analysis
```

### Route 4: Mental Health Shield
```
POST /api/mental-health-shield
│
├─ Security:
│  └─ CLERK_SECRET_KEY
│
├─ Validation:
│  └─ SUPABASE_SERVICE_ROLE_KEY (check user XP)
│
├─ Protection:
│  └─ SUPABASE_SERVICE_ROLE_KEY (enable 7-day shield)
│
└─ Response:
   └─ Shield activated, XP deducted
```

### Route 5: Stripe Checkout
```
POST /api/stripe/create-checkout
│
├─ Security:
│  └─ CLERK_SECRET_KEY
│
├─ Payment Processing:
│  └─ STRIPE_SECRET_KEY + STRIPE_PRO_PRICE_ID
│
├─ Session Creation:
│  └─ Store metadata in Stripe
│
└─ Response:
   └─ Checkout URL
```

### Route 6: Stripe Webhook (Incoming)
```
POST /api/stripe/webhook
│
├─ Verification:
│  └─ STRIPE_WEBHOOK_SECRET
│
├─ Event Handling:
│  ├─ payment_intent.succeeded
│  └─ Event contains userId
│
├─ Database Update:
│  └─ SUPABASE_SERVICE_ROLE_KEY
│     UPDATE users.subscription_status = 'pro'
│
└─ Response:
   └─ 200 OK acknowledgment
```

---

## Environment Variables Used Per Route

| Route | Clerk | Supabase | Gemini | OpenAI | Stripe |
|-------|-------|----------|--------|--------|--------|
| `/api/habits/[id]/complete` | ✓ Secret | ✓ Service Role | - | - | - |
| `/api/ai-coach` | ✓ Secret | ✓ Service Role | ✓ Key | - | - |
| `/api/voice-dump` | ✓ Secret | ✓ Service Role | ✓ Key | ✓ Key | - |
| `/api/mood-checkin` | ✓ Secret | ✓ Service Role | - | - | - |
| `/api/mental-health-shield` | ✓ Secret | ✓ Service Role | - | - | - |
| `/api/stripe/create-checkout` | ✓ Secret | ✓ Service Role | - | - | ✓ Secret |
| `/api/stripe/webhook` | - | ✓ Service Role | - | - | ✓ Webhook Secret |

---

## Data Flow Diagrams

### Complete Habit Flow
```
User clicks "Complete" on HabitCard in UI
                ▼
          Get habit_id
                ▼
    POST /api/habits/1/complete
                ▼
    ┌─────────────────────────┐
    │  Clerk Auth             │
    │  Check CLERK_SECRET_KEY │
    └─────────────────────────┘
                ▼
    ┌─────────────────────────┐
    │  Supabase Operations    │
    │  Service Role Key       │
    │                         │
    │  • Save completion      │
    │  • Calculate XP         │
    │  • Check badges         │
    │  • Update streak        │
    └─────────────────────────┘
                ▼
          Response {
            xp_awarded: 25,
            new_level: 5,
            streak: 7
          }
                ▼
Frontend Animation (Framer Motion)
```

### Voice Journal Flow
```
User records audio (5-30 seconds)
                ▼
        Submit to POST /api/voice-dump
                ▼
    ┌─────────────────────────┐
    │  Clerk Auth             │
    └─────────────────────────┘
                ▼
    ┌─────────────────────────┐
    │  OpenAI Whisper         │
    │  OPENAI_API_KEY         │
    │                         │
    │  Audio → Transcript     │
    └─────────────────────────┘
                ▼
        transcript = "I'm..."
                ▼
    ┌─────────────────────────┐
    │  Gemini Analysis        │
    │  GEMINI_API_KEY         │
    │                         │
    │  Sentiment Analysis     │
    │  Stress Detection       │
    └─────────────────────────┘
                ▼
        {
          sentiment: -0.3,
          stress: 65,
          insights: "..."
        }
                ▼
    ┌─────────────────────────┐
    │  Supabase Storage       │
    │  Save all results       │
    └─────────────────────────┘
                ▼
Frontend Display Insights
```

### AI Coach Conversation Flow
```
User: "Help with morning routine"
                ▼
        POST /api/ai-coach
                ▼
    ┌─────────────────────────┐
    │  1. Load History        │
    │  Supabase              │
    │  (8 previous messages)  │
    └─────────────────────────┘
                ▼
    ┌─────────────────────────┐
    │  2. Create Prompt       │
    │  Include:               │
    │  • User context         │
    │  • Latest mood          │
    │  • Streak info          │
    │  • XP level             │
    └─────────────────────────┘
                ▼
    ┌─────────────────────────┐
    │  3. Call Gemini         │
    │  GEMINI_API_KEY         │
    │  Model: 2.5-flash       │
    │  Stream: true           │
    └─────────────────────────┘
                ▼
    ┌─────────────────────────┐
    │  4. Stream Response     │
    │  SSE (Server-Sent      │
    │  Events) to frontend    │
    │                         │
    │  data: {"text": "Hey"}  │
    │  data: {"text": "..."}  │
    └─────────────────────────┘
                ▼
    ┌─────────────────────────┐
    │  5. Save Conversation   │
    │  Insert into            │
    │  ai_coach_messages      │
    │  (fire-and-forget)      │
    └─────────────────────────┘
                ▼
Frontend Renders Streaming Text (Real-time)
```

---

## Environment Variable Checklist for Production

```bash
# ✅ REQUIRED (App won't run without these)
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...

# ⚠️ OPTIONAL (For Pro tier)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# ℹ️ CONFIG
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Quick Integration Test

Run this to verify all connections are working:

```bash
#!/bin/bash

echo "Testing Healthy Buddy API Integration..."
echo "=========================================="

# Test 1: Clerk
echo "✓ Checking Clerk..."
test -n "$CLERK_SECRET_KEY" && echo "  ✅ CLERK_SECRET_KEY found" || echo "  ❌ CLERK_SECRET_KEY missing"

# Test 2: Supabase
echo "✓ Checking Supabase..."
test -n "$SUPABASE_SERVICE_ROLE_KEY" && echo "  ✅ SUPABASE_SERVICE_ROLE_KEY found" || echo "  ❌ Service role missing"

# Test 3: Gemini
echo "✓ Checking Gemini..."
test -n "$GEMINI_API_KEY" && echo "  ✅ GEMINI_API_KEY found" || echo "  ❌ Gemini API key missing"

# Test 4: OpenAI
echo "✓ Checking OpenAI..."
test -n "$OPENAI_API_KEY" && echo "  ✅ OPENAI_API_KEY found" || echo "  ❌ OpenAI API key missing"

# Test 5: Stripe (optional)
echo "✓ Checking Stripe..."
if test -n "$STRIPE_SECRET_KEY"; then
  echo "  ✅ STRIPE_SECRET_KEY found (Pro tier enabled)"
else
  echo "  ⚠️  STRIPE_SECRET_KEY missing (Pro tier disabled)"
fi

echo ""
echo "=========================================="
echo "Integration check complete!"
```

---

## File Reference

All API environment variables are documented in:

- **`.env.local`** ← Your secrets (don't commit)
- **`.env.example`** ← Template for new developers
- **`ENVIRONMENT_SETUP.md`** ← Step-by-step verification
- **`API_CONNECTIONS.md`** ← Technical mapping
- **`ARCHITECTURE.md`** ← System design
