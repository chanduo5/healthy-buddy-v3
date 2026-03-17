// app/api/auth/me/route.ts  — FIXED (await auth)
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminSupabase()

    const { data: existing } = await supabase
      .from('users').select('*').eq('clerk_id', userId).single()
    if (existing) return NextResponse.json({ data: existing })

    // First login — create user from Clerk data
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
    const displayName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        clerk_id: userId,
        email,
        display_name: displayName,
        avatar_url: clerkUser?.imageUrl ?? null,
        username: clerkUser?.username ?? null,
      })
      .select('*').single()

    if (error) {
      console.error('Create user error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: newUser }, { status: 201 })
  } catch (err: any) {
    console.error('GET /api/auth/me error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
