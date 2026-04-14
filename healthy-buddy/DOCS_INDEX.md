# 📚 Documentation Index - Complete Guide

Welcome! Here's a roadmap to understand your Healthy Buddy API setup and architecture.

## 🎯 Start Here (5 minutes)

### For Quick Overview:
👉 **Read First:** [`QUICK_START.md`](QUICK_START.md)
- What's been done
- What you need to do (1-2 API keys only)
- Testing each feature
- FAQ

---

## 📖 Read These Based on Your Need

### 🚀 "I want to get the app running NOW"
1. **[`QUICK_START.md`](QUICK_START.md)** (5 min) - Overview + next steps
2. **[`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md)** (15 min) - Follow the checklist
3. Run `npm run dev` and test!

### 🔧 "I want to understand how everything connects"
1. **[`API_SETUP_SUMMARY.md`](API_SETUP_SUMMARY.md)** (5 min) - Connection overview
2. **[`API_CONNECTIONS.md`](API_CONNECTIONS.md)** (10 min) - Which API does what
3. **[`ARCHITECTURE.md`](ARCHITECTURE.md)** (15 min) - System design
4. **[`API_INTEGRATION_DIAGRAM.md`](API_INTEGRATION_DIAGRAM.md)** (10 min) - Visual diagrams

### 🛠️ "I want detailed setup instructions"
1. **[`SETUP_GUIDE.md`](SETUP_GUIDE.md)** - Complete setup with all APIs
2. **[`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md)** - Verification checklist

### 🐛 "I have an error / something doesn't work"
1. **[`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md)** → "Common Issues & Solutions"
2. **[`API_CONNECTIONS.md`](API_CONNECTIONS.md)** → Check which API is involved
3. **[`ARCHITECTURE.md`](ARCHITECTURE.md)** → See data flow for that feature

### 📱 "I want to deploy to production"
1. **[`SETUP_GUIDE.md`](SETUP_GUIDE.md)** → "Deployment" section
2. **[`ARCHITECTURE.md`](ARCHITECTURE.md)** → "Deployment Checklist"

---

## 📄 Document Overview

| File | Purpose | Read Time | Best For |
|------|---------|-----------|----------|
| **QUICK_START.md** | Action summary + next steps | 5 min | Getting started ASAP |
| **API_SETUP_SUMMARY.md** | Connection overview + checklist | 5 min | Understanding what's connected |
| **ENVIRONMENT_SETUP.md** | Step-by-step verification | 15 min | Setting up each API |
| **API_CONNECTIONS.md** | Technical API mapping | 10 min | Knowing which env var → which feature |
| **ARCHITECTURE.md** | System design + data flows | 15 min | Understanding how everything works |
| **API_INTEGRATION_DIAGRAM.md** | Visual diagrams + flows | 10 min | Visual learners |
| **SETUP_GUIDE.md** | Detailed instructions | 20 min | Complete setup guide |
| **README.md** | Project overview | 5 min | What is Healthy Buddy? |

---

## 🎓 Environment Variables Quick Reference

### Frontend-Accessible (Public)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Server-Only (Secret) ⚠️
```bash
CLERK_SECRET_KEY=sk_test_...              # Authentication
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Database admin access
GEMINI_API_KEY=AIzaSy...                  # AI Coach + Sentiment
OPENAI_API_KEY=sk-proj-...                # Voice Transcription ← ADD THIS
STRIPE_SECRET_KEY=sk_test_...             # Payments (optional)
STRIPE_WEBHOOK_SECRET=whsec_...           # Webhook verification (optional)
STRIPE_PRO_PRICE_ID=price_...             # Pro tier pricing (optional)
```

---

## 🔄 API Data Flows

### Complete Habit
```
User → HabitCard [Complete] → API Route /api/habits/[id]/complete
  → Clerk verifies user
  → Supabase saves achievement
  → Award XP + check badges
  → Frontend animation
```

### AI Coach Chat
```
User Message → AiCoachPanel → API Route /api/ai-coach
  → Clerk verifies user
  → Supabase loads history
  → Gemini generates response (streaming)
  → Supabase saves conversation
  → Frontend displays real-time text
```

### Voice Journal
```
Audio Recording → VoiceDumpModal → API Route /api/voice-dump
  → Clerk verifies user
  → OpenAI transcribes audio → Transcript
  → Gemini analyzes sentiment → Analysis
  → Supabase saves transcript + analysis
  → Frontend displays insights
```

### Mental Health Shield
```
[Activate] → API Route /api/mental-health-shield
  → Clerk verifies user
  → Supabase checks user XP ≥ 50
  → Deduct 50 XP
  → Enable 7-day protection
  → Frontend updates display
```

---

## 🛡️ Security Practices

✅ DO:
- Keep all keys in `.env.local` (never commit)
- Use `NEXT_PUBLIC_*` only for public variables
- Keep secret keys on server-only
- Regenerate if accidentally exposed

❌ DON'T:
- Commit `.env.local` to git
- Expose `CLERK_SECRET_KEY` in frontend
- Share API keys in chat/email
- Use same key for dev and production

---

## 📊 File Dependencies

```
.env.local (Your secrets)
    ↓
.env.example (Template)
    ↓
├─ middleware.ts (Uses Clerk)
├─ lib/supabase/client.ts (Uses Supabase public keys)
├─ lib/supabase/server.ts (Uses Supabase secret key)
├─ app/api/ai-coach/route.ts (Uses Clerk + Supabase + Gemini)
├─ app/api/voice-dump/route.ts (Uses Clerk + Supabase + OpenAI + Gemini)
├─ app/api/mood-checkin/route.ts (Uses Clerk + Supabase)
├─ app/api/mental-health-shield/route.ts (Uses Clerk + Supabase)
├─ app/api/stripe/* (Uses Clerk + Supabase + Stripe)
└─ Components (Use frontend client libs)
```

---

## 🚀 Getting Started Checklist

- [ ] Read **QUICK_START.md** (5 min)
- [ ] Add `OPENAI_API_KEY` to `.env.local`
- [ ] Run `npm run dev`
- [ ] Test each feature (sign up, habit, AI, voice)
- [ ] Read **ENVIRONMENT_SETUP.md** if issues
- [ ] Read **ARCHITECTURE.md** to understand system
- [ ] Deploy to production (follow SETUP_GUIDE.md)

---

## 🆘 Troubleshooting Guide

### Problem: "Cannot find module 'openai'"
→ Check if `npm install` was run
→ Verify `openai` is in package.json dependencies

### Problem: AI Coach not responding
→ Check GEMINI_API_KEY in `.env.local`
→ Verify API is enabled in Google Console
→ Check rate limits (60 req/min free tier)

### Problem: Voice transcription fails
→ Check OPENAI_API_KEY in `.env.local`
→ Verify OpenAI has billing method on file
→ Allow microphone permission in browser

### Problem: Supabase connection error
→ Verify SUPABASE_SERVICE_ROLE_KEY
→ Check database is created
→ Verify RLS policies are enabled

### Problem: Auth redirects to wrong page
→ Check Clerk redirect URLs
→ Verify CLERK_SECRET_KEY is correct
→ Check NEXT_PUBLIC_CLERK_* variables

More solutions in **ENVIRONMENT_SETUP.md** under "Common Issues & Solutions"

---

## 📱 Feature Checklist

What requires which environment variables:

| Feature | Status | Needs | Notes |
|---------|--------|-------|-------|
| Sign up/Sign in | ✅ Working | Clerk | Already configured |
| Create habits | ✅ Working | Clerk + Supabase | Already configured |
| Complete habits | ✅ Working | Clerk + Supabase | Already configured |
| AI Coach | ✅ Working | Clerk + Supabase + Gemini | Already configured |
| Voice journaling | ⏳ Waiting | Clerk + Supabase + **OpenAI** + Gemini | **Need OPENAI_API_KEY** |
| Mood check-ins | ✅ Working | Clerk + Supabase | Already configured |
| Mental health shield | ✅ Working | Clerk + Supabase | Already configured |
| Analytics/Heatmap | ✅ Working | Clerk + Supabase | Already configured |
| Pro subscriptions | ⏳ Optional | Clerk + Supabase + Stripe | Add if needed |

---

## 🎯 Next Actions

### Immediate (Right Now):
1. Add `OPENAI_API_KEY` to `.env.local`
2. Run `npm run dev`
3. Test features

### Short-term (This Week):
1. Read `ARCHITECTURE.md` to understand the system
2. Deploy to Vercel or your hosting
3. Add production API keys

### Long-term (Future):
1. Add Stripe keys if you want Pro tier
2. Set up analytics/monitoring
3. Customize AI coach prompts

---

## 💡 Key Concepts

### Environment Variables (.env.local)
Secret configuration that changes per environment (local, staging, production)

### Clerk
Handles user authentication (sign up, sign in, sessions)

### Supabase
PostgreSQL database with built-in auth integration

### Gemini
Google's AI model for AI Coach and sentiment analysis

### OpenAI
For speech-to-text transcription using Whisper model

### Stripe
Payment processor for Pro subscriptions (optional)

---

## 📞 Support Resources

- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## ✨ Summary

You now have:
- ✅ Properly configured environment variables
- ✅ Complete API mapping documentation
- ✅ Step-by-step setup verification
- ✅ System architecture diagrams
- ✅ Troubleshooting guides
- ✅ Deployment instructions

**Your next step:** 👉 Add `OPENAI_API_KEY` and run `npm run dev`

**Questions?** Check the appropriate document above based on your need.

Good luck! 🚀
