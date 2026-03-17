// app/api/badges/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabase()
  const { data: dbUser } = await supabase
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: allBadges }, { data: earned }] = await Promise.all([
    supabase.from('badges').select('*').order('xp_bonus'),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', dbUser.id),
  ])

  const earnedMap = new Map(earned?.map(e => [e.badge_id, e.earned_at]) ?? [])

  const badgesWithStatus = allBadges?.map(b => ({
    ...b,
    earned: earnedMap.has(b.id),
    earned_at: earnedMap.get(b.id) ?? null,
  })) ?? []

  return NextResponse.json({ data: badgesWithStatus })
}
