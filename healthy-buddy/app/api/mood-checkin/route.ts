// app/api/mood-checkin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { energy_level, mood_level } = await req.json()

    if (!energy_level || !mood_level) {
      return NextResponse.json({ error: 'Energy and mood levels required' }, { status: 400 })
    }

    const supabase = createAdminSupabase()

    // Get or create user
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

    // Insert mood checkin
    const { error } = await supabase
      .from('mood_checkins')
      .upsert({
        user_id: dbUser.id,
        energy_level,
        mood_level,
        date: new Date().toISOString().split('T')[0]
      })

    if (error) {
      console.error('Mood checkin error:', error)
      return NextResponse.json({ error: 'Failed to save checkin' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Mood checkin route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}