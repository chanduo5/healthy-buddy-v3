// app/api/habits/route.ts  — FIXED
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const XP_BY_DIFFICULTY: Record<string, number> = { easy: 10, medium: 20, hard: 30 }

const createHabitSchema = z.object({
  name:           z.string().min(1, 'Name required').max(100),
  description:    z.string().max(300).optional().default(''),
  icon:           z.string().default('⭐'),
  color:          z.string().default('#4ade80'),
  difficulty:     z.enum(['easy', 'medium', 'hard']).default('medium'),
  frequency:      z.enum(['daily', 'weekly', 'custom']).default('daily'),
  frequency_days: z.array(z.number()).default([1,2,3,4,5,6,7]),
  target_count:   z.number().min(1).default(1),
  unit:           z.string().optional().default(''),
  category:       z.string().default('health'),
})

// ── helpers ────────────────────────────────────────────────────────────────
async function getOrCreateUser(supabase: any, userId: string) {
  const { data } = await supabase
    .from('users').select('id, plan').eq('clerk_id', userId).single()
  if (data) return data

  // Auto-create on first hit (handles race with /api/auth/me)
  const { data: created } = await supabase
    .from('users')
    .insert({ clerk_id: userId, email: '' })
    .select('id, plan').single()
  return created
}

// ── GET /api/habits ────────────────────────────────────────────────────────
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminSupabase()
    const dbUser = await getOrCreateUser(supabase, userId)
    if (!dbUser) return NextResponse.json({ data: [] })   // return empty instead of 404

    const today = new Date().toISOString().split('T')[0]
    const [habitsRes, logsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', dbUser.id).eq('is_active', true).order('sort_order'),
      supabase.from('habit_logs').select('habit_id').eq('user_id', dbUser.id).eq('date', today),
    ])

    if (habitsRes.error) {
      console.error('GET habits error:', habitsRes.error)
      return NextResponse.json({ data: [] })
    }

    const completedIds = new Set((logsRes.data ?? []).map((l: any) => l.habit_id))
    const habits = (habitsRes.data ?? []).map((h: any) => ({
      ...h,
      completed_today: completedIds.has(h.id),
    }))

    return NextResponse.json({ data: habits })
  } catch (err: any) {
    console.error('GET /api/habits error:', err)
    return NextResponse.json({ data: [] })
  }
}

// ── POST /api/habits ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const raw = await req.json()
    const parsed = createHabitSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = createAdminSupabase()
    const dbUser = await getOrCreateUser(supabase, userId)
    if (!dbUser) return NextResponse.json({ error: 'Could not create user' }, { status: 500 })

    // Free plan: max 5 habits
    if (dbUser.plan === 'free') {
      const { count } = await supabase
        .from('habits').select('*', { count: 'exact', head: true })
        .eq('user_id', dbUser.id).eq('is_active', true)
      if ((count ?? 0) >= 5) {
        return NextResponse.json(
          { error: 'Free plan limit: 5 habits. Upgrade to Pro for unlimited.' },
          { status: 403 }
        )
      }
    }

    // Get max sort_order
    const { data: lastHabit } = await supabase
      .from('habits').select('sort_order').eq('user_id', dbUser.id).order('sort_order', { ascending: false }).limit(1).single()
    const nextSortOrder = (lastHabit?.sort_order ?? -1) + 1

    const insertData = {
      ...parsed.data,
      user_id: dbUser.id,
      xp_reward: XP_BY_DIFFICULTY[parsed.data.difficulty] ?? 10,
      sort_order: nextSortOrder,
    }

    const { data, error } = await supabase
      .from('habits').insert(insertData).select().single()

    if (error) {
      console.error('INSERT habit error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/habits error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
