// app/api/habits/heatmap/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { getHeatmapLevel } from '@/lib/gamification'
import { HeatmapDay } from '@/types'
import { format, eachDayOfInterval, subDays, startOfYear } from 'date-fns'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabase()
  const { data: dbUser } = await supabase
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get logs for the past year
  const today = new Date()
  const yearAgo = startOfYear(today)

  const { data: logs } = await supabase
    .from('habit_logs')
    .select('date, xp_earned')
    .eq('user_id', dbUser.id)
    .gte('date', format(yearAgo, 'yyyy-MM-dd'))
    .order('date')

  // Get total habits count (for completion ratio)
  const { count: totalHabits } = await supabase
    .from('habits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', dbUser.id)
    .eq('is_active', true)

  // Group logs by date
  const logsByDate = new Map<string, { count: number; xp: number }>()
  for (const log of logs ?? []) {
    const existing = logsByDate.get(log.date) ?? { count: 0, xp: 0 }
    logsByDate.set(log.date, {
      count: existing.count + 1,
      xp: existing.xp + log.xp_earned,
    })
  }

  // Build full year grid
  const allDays = eachDayOfInterval({ start: yearAgo, end: today })
  const heatmapData: HeatmapDay[] = allDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayData = logsByDate.get(dateStr)
    return {
      date: dateStr,
      count: dayData?.count ?? 0,
      xp: dayData?.xp ?? 0,
      level: getHeatmapLevel(dayData?.count ?? 0, totalHabits ?? 1),
    }
  })

  return NextResponse.json({ data: heatmapData })
}
