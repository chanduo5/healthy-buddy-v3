// app/api/mood-checkin/latest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminSupabase()

    // Get user
    const { data: dbUser } = await supabase
      .from('users').select('id').eq('clerk_id', userId).single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get latest mood checkin for today
    const today = new Date().toISOString().split('T')[0]
    const { data: checkin } = await supabase
      .from('mood_checkins')
      .select('energy_level, mood_level')
      .eq('user_id', dbUser.id)
      .eq('date', today)
      .single()

    return NextResponse.json(checkin || null)
  } catch (err: any) {
    console.error('Latest mood checkin route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}