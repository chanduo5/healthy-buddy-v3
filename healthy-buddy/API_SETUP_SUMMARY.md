# 🚀 Healthy Buddy v3 - API Setup Summary

## Your Environment Variables Are Now Properly Configured! ✅

### Files Created/Updated:
1. **`.env.local`** - Your local development environment variables
2. **`.env.example`** - Template for new developers
3. **`API_CONNECTIONS.md`** - Complete API mapping guide
4. **`ENVIRONMENT_SETUP.md`** - Step-by-step setup verification
5. **`ARCHITECTURE.md`** - System architecture & data flows

---

## 🎯 What's Connected:

### ✅ Core Stack
- **Clerk** → User authentication & sessions
- **Supabase** → All app data (habits, users, analytics, etc.)
- **Schema** → Auto-created tables with RLS policies

### ✅ AI Features (Google-Optimized)
- **Gemini** → AI Coach + Sentiment Analysis
- **OpenAI** → Voice Transcription (Whisper)

### ✅ Optional
- **Stripe** → Pro subscriptions (if needed)

---

## 📋 Required API Keys to Add to `.env.local`

### 1️⃣ **OPENAI_API_KEY** (CRITICAL - for voice transcription)
```bash
OPENAI_API_KEY=sk-proj-abc123...
```
Get from: https://platform.openai.com/api-keys

---

### 2️⃣ **STRIPE keys** (if using Pro tier)
```bash
STRIPE_SECRET_KEY=sk_test_...
```
Get from: https://dashboard.stripe.com/apikeys

---

## 🧪 Quick Test (30 seconds)

```bash
# 1. Make sure all env vars are in .env.local
# 2. Start dev server
npm run dev

# 3. Test each feature:
✅ Sign up (Clerk works)
✅ Create habit (Supabase works)
✅ Ask AI Coach (Gemini works)
✅ Record voice (OpenAI works)
```

---

## 📍 File Locations

### Environment Files
```
.env.local              ← Your secrets (don't commit!)
.env.example            ← Template for new devs
```

### Documentation
```
SETUP_GUIDE.md          ← Detailed setup instructions
ENVIRONMENT_SETUP.md    ← Setup verification checklist
API_CONNECTIONS.md      ← Which API connects where
ARCHITECTURE.md         ← System diagram & data flows
```

### Code Files Using Environment Variables

```
lib/supabase/client.ts      → Uses NEXT_PUBLIC_SUPABASE_*
lib/supabase/server.ts      → Uses SUPABASE_SERVICE_ROLE_KEY
middleware.ts               → Uses Clerk env vars
app/api/ai-coach/route.ts   → Uses GEMINI_API_KEY
app/api/voice-dump/route.ts → Uses OPENAI_API_KEY + GEMINI_API_KEY
app/api/stripe/              → Uses STRIPE_* keys
```

---

## 🔗 API Connections Map

### When User Completes a Habit:
```
Frontend HabitCard
  ↓
[Complete Button] → POST /api/habits/[id]/complete
  ↓
Clerk validates user (CLERK_SECRET_KEY)
  ↓
Supabase saves completion + awards XP (SUPABASE_SERVICE_ROLE_KEY)
  ↓
Frontend updates with animation + XP display
```

### When User Uses AI Coach:
```
Frontend AiCoachPanel
  ↓
[Send Message] → POST /api/ai-coach
  ↓
Clerk validates user
  ↓
Supabase loads conversation history
  ↓
Gemini generates response (GEMINI_API_KEY)
  ↓
Streaming response back to frontend
  ↓
Supabase saves conversation (fire-and-forget)
```

### When User Records Voice:
```
Frontend VoiceDumpModal
  ↓
[Record & Save] → POST /api/voice-dump
  ↓
Clerk validates user
  ↓
OpenAI transcribes audio (OPENAI_API_KEY)
  ↓
Gemini analyzes sentiment (GEMINI_API_KEY)
  ↓
Supabase saves results
  ↓
Frontend displays transcript + insights
```

---

## ⚠️ Critical Environment Variables

### MUST HAVE (App won't work without these):
```bash
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GEMINI_API_KEY
✅ OPENAI_API_KEY
```

### SHOULD HAVE (For full features):
```bash
⚠️ STRIPE_SECRET_KEY (if using Pro tier)
⚠️ STRIPE_WEBHOOK_SECRET (if using Pro tier)
⚠️ STRIPE_PRO_PRICE_ID (if using Pro tier)
```

### DON'T EXPOSE (These are secrets!):
```bash
❌ Never add CLERK_SECRET_KEY to frontend code
❌ Never add SUPABASE_SERVICE_ROLE_KEY to frontend code
❌ Never commit .env.local to git (add to .gitignore)
❌ Never share API keys in Slack/Discord/GitHub
```

---

## 🧪 Verification Steps

### 1. Clerk Working?
```bash
npm run dev
→ Go to http://localhost:3000/auth/sign-up
→ Create account
→ Should redirect to /onboarding
✅ If yes, Clerk is working
```

### 2. Supabase Working?
```bash
→ Go to /dashboard
→ Add a habit
→ Check Supabase dashboard (Table Editor)
✅ If habit appears in table, Supabase is working
```

### 3. Gemini Working?
```bash
→ Scroll to AI Coach section
→ Ask: "What's a good morning routine?"
→ Wait for streaming response
✅ If response appears, Gemini is working
```

### 4. OpenAI Working?
```bash
→ Look for Voice Journal button
→ Click to record (allow microphone)
→ Record 5 seconds of speech
→ Click save
✅ If transcript appears, OpenAI is working
```

---

## 🛠️ Troubleshooting

### Problem: "Cannot find api key"
**Solution:** Check variable name matches exactly (case-sensitive)
```bash
❌ Wrong: gemini_api_key
✅ Right: GEMINI_API_KEY
```

### Problem: Habits not saving
**Solution:** Check Supabase RLS policies
- Go to Supabase dashboard → Table Editor
- Click each table → RLS policies
- Should see `select_own_data`, `insert_own_data`, etc.

### Problem: AI Coach returns 500 error
**Solution:** Verify GEMINI_API_KEY
- Check key starts with `AIzaSy...`
- Verify API is enabled in Google Cloud
- Check quota limits (free tier has 60 req/min)

### Problem: Voice recording fails
**Solution:** Check OpenAI API key & browser permissions
- Allow microphone in browser
- Check OPENAI_API_KEY in .env.local
- Verify OpenAI has active billing

---

## 📚 Next Steps

1. **Add missing API keys to `.env.local`:**
   - [ ] `OPENAI_API_KEY` (for voice)
   - [ ] `STRIPE_SECRET_KEY` (optional, for Pro)

2. **Run the app:**
   ```bash
   npm run dev
   ```

3. **Test each feature** (see Verification Steps above)

4. **Deploy to production:**
   - Update all env vars in your hosting platform
   - See SETUP_GUIDE.md for Vercel deployment

5. **Celebrate! 🎉**
   - Your Healthy Buddy app is fully connected

---

## 📞 Quick Reference

| Feature | API | Environment Variable | Status |
|---------|-----|----------------------|--------|
| Authentication | Clerk | `CLERK_SECRET_KEY` | ✅ |
| Database | Supabase | `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| AI Coach | Gemini | `GEMINI_API_KEY` | ✅ |
| Voice Transcription | OpenAI | `OPENAI_API_KEY` | ⏳ Add this |
| Payments | Stripe | `STRIPE_SECRET_KEY` | ⏳ Optional |

---

## 📖 Documentation Map

```
README.md                   ← Overview & features
SETUP_GUIDE.md             ← Detailed setup with all APIs
ENVIRONMENT_SETUP.md       ← Step-by-step verification ✅ USE THIS FIRST
API_CONNECTIONS.md         ← Technical API mapping
ARCHITECTURE.md            ← System design & data flows
.env.example               ← Env var template
```

Start with **ENVIRONMENT_SETUP.md** - it has a checklist to verify each API works! ✅
