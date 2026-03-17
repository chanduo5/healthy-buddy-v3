// app/api/habits/[id]/complete/route.ts  — FIXED
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { calculateXpReward, calculateLevel } from '@/lib/gamification'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminSupabase()
    const today = new Date().toISOString().split('T')[0]

    const [{ data: dbUser }, { data: habit }] = await Promise.all([
      supabase.from('users').select('*').eq('clerk_id', userId).single(),
      supabase.from('habits').select('*').eq('id', params.id).single(),
    ])

    if (!dbUser || !habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (habit.user_id !== dbUser.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: existingLog } = await supabase
      .from('habit_logs').select('id').eq('habit_id', params.id).eq('date', today).single()
    if (existingLog) return NextResponse.json({ error: 'Already completed today' }, { status: 409 })

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const isConsecutive = habit.last_completed === yesterday || habit.last_completed === today
    const newStreak = isConsecutive ? habit.current_streak + 1 : 1

    const xpEarned = calculateXpReward(habit.difficulty, newStreak)
    const newUserXp = (dbUser.xp ?? 0) + xpEarned
    const newLevel = calculateLevel(newUserXp)
    const leveledUp = newLevel > (dbUser.level ?? 1)

    await Promise.all([
      supabase.from('habit_logs').insert({
        habit_id: params.id, user_id: dbUser.id, date: today, xp_earned: xpEarned,
      }),
      supabase.from('habits').update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, habit.longest_streak ?? 0),
        last_completed: today,
      }).eq('id', params.id),
      supabase.from('users').update({
        xp: newUserXp, level: newLevel,
        total_habits_completed: (dbUser.total_habits_completed ?? 0) + 1,
        current_streak: Math.max(newStreak, dbUser.current_streak ?? 0),
        longest_streak: Math.max(newStreak, dbUser.longest_streak ?? 0),
      }).eq('id', dbUser.id),
      supabase.from('xp_transactions').insert({
        user_id: dbUser.id, amount: xpEarned,
        reason: `Completed: ${habit.name}`, habit_id: params.id,
      }),
    ])

    return NextResponse.json({ data: { xpEarned, newStreak, newLevel, leveledUp, newTotalXp: newUserXp } })
  } catch (err: any) {
    console.error('POST complete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminSupabase()
    const today = new Date().toISOString().split('T')[0]

    const { data: dbUser } = await supabase.from('users').select('id, xp').eq('clerk_id', userId).single()
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: log } = await supabase
      .from('habit_logs').select('id, xp_earned').eq('habit_id', params.id).eq('date', today).single()
    if (!log) return NextResponse.json({ error: 'No completion to undo' }, { status: 404 })

    await Promise.all([
      supabase.from('habit_logs').delete().eq('id', log.id),
      supabase.from('users').update({ xp: Math.max(0, (dbUser.xp ?? 0) - log.xp_earned) }).eq('id', dbUser.id),
    ])

    return NextResponse.json({ data: { xpRefunded: log.xp_earned } })
  } catch (err: any) {
    console.error('DELETE complete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
