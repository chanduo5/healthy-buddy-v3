# 🔗 API Architecture & Data Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTHY BUDDY ECOSYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────────┐  │
│  │  Components   │ │     Hooks      │ │   State Management   │  │
│  │  (React)      │ │  useHabits()   │ │   (Zustand Store)    │  │
│  └───────────────┘ └────────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Next.js API Routes │
                    │   (Node.js/SSR)     │
                    └─────────────────────┘
         ↓              ↓              ↓              ↓
      ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
      │  Clerk  │  │ Supabase │  │  Gemini  │  │  OpenAI  │
      │  Auth   │  │Database  │  │   AI     │  │ Whisper  │
      └─────────┘  └──────────┘  └──────────┘  └──────────┘
```

## Detailed Data Flows

### 🔐 Flow 1: Authentication & Session
```
User → Browser → Clerk Sign-In Page
  ↓
User enters credentials
  ↓
Clerk validates → Returns JWT token
  ↓
next/auth() hook → Extracts userId
  ↓
API Routes: Check auth() before processing
  ↓
Supabase: Uses SUPABASE_SERVICE_ROLE_KEY to operate as admin
  ↓
✅ User authenticated, can access dashboard
```

### 📊 Flow 2: Create & Complete Habit
```
User → HabitCard Component
  ↓
[Add] Button → POST /api/habits
  ├─ Auth: Verify user via CLERK_SECRET_KEY
  ├─ Database: INSERT into habits table via SUPABASE_SERVICE_ROLE_KEY
  └─ Response: Return habit object to frontend
  ↓
[Complete] Button → POST /api/habits/[id]/complete
  ├─ Auth: Verify user via CLERK (userId)
  ├─ Database: 
  │  ├─ INSERT into habit_completions
  │  ├─ UPDATE habits set last_completed = now()
  │  └─ Award XP based on difficulty
  ├─ Check: Milestone badges (check if eligible)
  ├─ Gamification: Calculate streak bonus (lib/gamification.ts)
  └─ Response: Return XP + animation data
  ↓
Frontend: Play XpFloatingPop animation
```

### 🤖 Flow 3: AI Coach Conversation
```
User → AiCoachPanel Component
  ↓
User types "I'm stuck on morning routine"
  ↓
POST /api/ai-coach
  ├─ Auth: Verify user via CLERK_SECRET_KEY
  ├─ Database: 
  │  ├─ GET last 8 messages from ai_coach_messages table
  │  └─ INSERT user message (fire-and-forget)
  ├─ Gemini: 
  │  ├─ Initialize: new GoogleGenerativeAI(GEMINI_API_KEY)
  │  ├─ Model: gemini-2.5-flash
  │  ├─ System Prompt: buildSystemPrompt() with user context
  │  └─ Content: [history...] + user message
  ├─ Stream: Response via Server-Sent Events
  │  └─ Send to frontend word-by-word to show streaming
  ├─ Database: INSERT assistant response (fire-and-forget)
  └─ Response: [DONE] signal
  ↓
Frontend: Renders streaming text in real-time
```

### 🎙️ Flow 4: Voice Journal Entry
```
User → VoiceDumpModal Component
  ↓
Click record → Browser API (getUserMedia)
  ↓
User speaks (5-30 seconds)
  ↓
Click save → POST /api/voice-dump (multipart/form-data)
  ├─ Auth: Verify user via CLERK_SECRET_KEY
  ├─ OpenAI Whisper:
  │  ├─ Initialize: new OpenAI({apiKey: OPENAI_API_KEY})
  │  ├─ Model: whisper-1
  │  └─ Input: Audio file (webm format)
  │  └─ Output: Transcript text
  ├─ Gemini Analysis:
  │  ├─ Initialize: new GoogleGenerativeAI(GEMINI_API_KEY)
  │  ├─ Model: gemini-2.5-flash
  │  ├─ Prompt: Analyze for sentiment, stress, insights
  │  └─ Output: {"sentiment": -0.5, "stress": 65, "insights": "..."}
  ├─ Database:
  │  └─ INSERT into voice_dumps (transcript, sentiment, stress)
  └─ Response: Return full analysis to frontend
  ↓
Frontend: Display transcript + insights
```

### 😊 Flow 5: Mood Check-In
```
User → EnergyMoodCheckin Modal
  ↓
Adjust energy (1-10) and mood (-5 to +5) sliders
  ↓
Click save → POST /api/mood-checkin
  ├─ Auth: Verify user via CLERK_SECRET_KEY
  ├─ Database:
  │  └─ UPSERT into mood_checkins (energy_level, mood_level, date)
  └─ Response: {success: true}
  ↓
Frontend: Modal closes, mood data stored
  ↓
Next AI Coach message considers mood context
  └─ System prompt includes: "User energy: 3/10, mood: -2/5"
```

### 🛡️ Flow 6: Mental Health Shield Activation
```
User → Mental Health Shield Button
  ↓
Shield cost: 50 XP (protection for 7 days)
  ↓
Click activate → POST /api/mental-health-shield
  ├─ Auth: Verify user via CLERK_SECRET_KEY
  ├─ Validation:
  │  ├─ Check user.xp >= 50
  │  └─ Check no active shield
  ├─ Database:
  │  ├─ UPDATE users set xp = xp - 50
  │  ├─ INSERT into mental_health_shields
  │  └─ Set shield end_date = now() + 7 days
  └─ Response: {success: true, xp_remaining: newXP}
  ↓
Frontend: Show shield status, deduct XP animation
```

### 💳 Flow 7: Stripe Upgrade (Optional)
```
User → Click "Upgrade to Pro"
  ↓
POST /api/stripe/create-checkout
  ├─ Auth: Verify user via CLERK_SECRET_KEY
  ├─ Stripe:
  │  ├─ Initialize: new Stripe(STRIPE_SECRET_KEY)
  │  ├─ Create session:
  │  │  ├─ price: STRIPE_PRO_PRICE_ID
  │  │  ├─ customer: user email
  │  │  └─ metadata: {userId: user.id}
  │  └─ Return: checkout session URL
  └─ Response: Redirect URL to Stripe
  ↓
Frontend: Redirect to Stripe checkout page
  ↓
User completes payment
  ↓
Stripe POST /api/stripe/webhook
  ├─ Verify: signature using STRIPE_WEBHOOK_SECRET
  ├─ Event: payment_intent.succeeded
  ├─ Database:
  │  └─ UPDATE users set subscription_status = 'pro'
  └─ Webhook response: 200 OK
```

## Environment Variables & Their Purpose

### Tier 1: Core (Required for basic app)
| Variable | Purpose | Used By | Type |
|----------|---------|---------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend Clerk initialization | middleware.ts, useAuth() | Public |
| `CLERK_SECRET_KEY` | Backend auth verification | All API routes | Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Database URL | Browser client | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser DB access | createClient() | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server DB access | API routes | Secret |

### Tier 2: AI Features (Required for AI functionality)
| Variable | Purpose | Used By | Type |
|----------|---------|---------|------|
| `GEMINI_API_KEY` | AI coaching + sentiment analysis | ai-coach, voice-dump routes | Secret |
| `OPENAI_API_KEY` | Voice transcription (Whisper) | voice-dump route | Secret |

### Tier 3: Premium (Optional, for subscriptions)
| Variable | Purpose | Used By | Type |
|----------|---------|---------|------|
| `STRIPE_SECRET_KEY` | Stripe backend operations | stripe routes | Secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe frontend initialization | upgrade page | Public |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | webhook route | Secret |
| `STRIPE_PRO_PRICE_ID` | Pro tier price ID | stripe routes | Public |

## API Request/Response Examples

### Habit Completion Request
```json
POST /api/habits/1/complete

{
  "userId": "user_2J3K4L5M",
  "difficulty": "medium"
}

Response 200:
{
  "success": true,
  "xp_awarded": 25,
  "new_level": 5,
  "streak": 7,
  "badge_earned": "Week Warrior"
}
```

### AI Coach Request
```json
POST /api/ai-coach

{
  "message": "I'm struggling with consistency",
  "context": {
    "level": 5,
    "streak": 7,
    "momentum": 0.85,
    "energy": 4,
    "mood": -1
  }
}

Response (Streaming SSE):
data: {"text": "Hey"}
data: {"text": "there!"}
data: {"text": " Your"}
data: {"text": " 7-day"}
...
data: [DONE]
```

### Voice Dump Request
```
POST /api/voice-dump
Content-Type: multipart/form-data

audio: [binary audio file]

Response 200:
{
  "transcript": "I'm having trouble sleeping at night",
  "sentiment": -0.3,
  "stress": 65,
  "insights": "Consider adding a wind-down routine..."
}
```

## Database Relationships

```sql
users (1) ──┬─→ (many) habits
            ├─→ (many) habit_completions
            ├─→ (many) ai_coach_messages
            ├─→ (many) mood_checkins
            ├─→ (many) voice_dumps
            ├─→ (many) mental_health_shields
            └─→ (many) badges

habits (1) ──→ (many) habit_completions
           ├─→ (many) mental_health_shields
           └─ mental_strain (Low/Medium/High)
```

## Deployment Checklist

- [ ] All `.env.local` variables added to production environment
- [ ] Clerk: Configure production redirect URLs
- [ ] Supabase: Update RLS policies for production domain
- [ ] Gemini: Verify API quotas and rate limits
- [ ] OpenAI: Check API billing and usage
- [ ] Stripe: Switch from test to live keys
- [ ] Middleware: Enable appropriate CORS headers
- [ ] Database: Run migrations on production
- [ ] Environment: Verify all NEXT_PUBLIC_* variables are accessible
