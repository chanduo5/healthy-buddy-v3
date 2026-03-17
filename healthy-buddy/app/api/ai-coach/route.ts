// app/api/ai-coach/route.ts — UPGRADED TO GEMINI
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai' // 🔄 Swapped SDK
import { createAdminSupabase } from '@/lib/supabase/server'
import { getMomentumLabel } from '@/lib/gamification'

// Initialize Gemini with your free API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { message, context } = body as { message: string; context: any }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    // Get or auto-create user
    let { data: dbUser } = await supabase
      .from('users').select('id').eq('clerk_id', userId).single()

    if (!dbUser) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ clerk_id: userId, email: '' })
        .select('id').single()
      if (!newUser) return NextResponse.json({ error: 'Could not find user' }, { status: 500 })
      dbUser = newUser
    }

    // Load last 8 messages
    const { data: history } = await supabase
      .from('ai_coach_messages')
      .select('role, content')
      .eq('user_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(8)

    // Save user message (non-blocking)
    // Fire-and-forget: we don't want to block the response on saving history.
    // `PostgrestFilterBuilder` returns a PromiseLike, so use `then(onFulfilled, onRejected)`.
    supabase.from('ai_coach_messages').insert({
      user_id: dbUser.id, role: 'user', content: message, context_data: context ?? null,
    }).then(() => {}, () => {})

    // 🔄 FORMAT HISTORY FOR GEMINI
    // Gemini uses 'model' instead of 'assistant', and nests text inside 'parts'
    const rawHistory = (history ?? []).reverse()
    const geminiHistory = rawHistory.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: msg.content }]
    }))

    const allMessages = [
      ...geminiHistory,
      { role: 'user', parts: [{ text: message }] },
    ]

    // Initialize the specific model with your system instructions
    const systemInstruction = buildSystemPrompt(context)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction 
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        try {
          // 🔄 EXECUTE GEMINI STREAM
          const result = await model.generateContentStream({
            contents: allMessages
          })

          for await (const chunk of result.stream) {
            const text = chunk.text()
            fullResponse += text
            // Keep your exact SSE format so the frontend doesn't break
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }

          // Save AI response to DB (Keep role as 'assistant' to maintain DB consistency)
          // Fire-and-forget storage; avoid blocking the response.
          supabase.from('ai_coach_messages').insert({
            user_id: dbUser!.id, role: 'assistant', content: fullResponse,
          }).then(() => {}, () => {})

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err: any) {
          console.error('Gemini stream error:', err?.message ?? err)
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ text: "\n\nSorry, hit a snag — try again! 🙏" })}\n\n`
          ))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err: any) {
    console.error('AI coach route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// System prompt remains untouched!
function buildSystemPrompt(ctx: any): string {
  if (!ctx) return `You are Healthy Buddy AI Coach. Be concise (under 120 words), warm, and specific. Use occasional emojis.`

  const habitsList = Array.isArray(ctx.activeHabits) && ctx.activeHabits.length > 0
    ? ctx.activeHabits.map((h: any) => `  - ${h.name} (${h.difficulty}, ${h.streak}d streak, ${h.completedToday ? '✓ done' : '○ pending'})`).join('\n')
    : '  (no habits yet)'

  return `You are Healthy Buddy AI Coach — motivating, insightful, concise.

User: ${ctx.userName ?? 'Champion'} · Level ${ctx.level ?? 1} · ${ctx.totalXp ?? 0} XP · ${ctx.currentStreak ?? 0}d streak · Momentum ${ctx.momentum ?? 0}/100 (${getMomentumLabel(ctx.momentum ?? 0)})

Habits today:
${habitsList}

Rules: Under 130 words · ONE specific tip · Reference habits by name · Adapt energy to momentum · Occasional emojis only · Never generic advice`
}