// app/api/mental-health-shield/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'

const SHIELD_COST = 100
const SHIELD_DURATION_HOURS = 24

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { reason } = await req.json()

    const supabase = createAdminSupabase()

    // Get user
    const { data: dbUser } = await supabase
      .from('users').select('id, xp').eq('clerk_id', userId).single()

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.xp < SHIELD_COST) {
      return NextResponse.json({ error: 'Insufficient XP' }, { status: 400 })
    }

    // Check for existing active shield
    const { data: activeShield } = await supabase
      .from('mental_health_shields')
      .select('id')
      .eq('user_id', dbUser.id)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (activeShield) {
      return NextResponse.json({ error: 'You already have an active shield' }, { status: 400 })
    }

    // Create shield
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + SHIELD_DURATION_HOURS)

    const { error: shieldError } = await supabase
      .from('mental_health_shields')
      .insert({
        user_id: dbUser.id,
        reason,
        xp_cost: SHIELD_COST,
        expires_at: expiresAt.toISOString(),
      })

    if (shieldError) {
      console.error('Shield creation error:', shieldError)
      return NextResponse.json({ error: 'Failed to create shield' }, { status: 500 })
    }

    // Deduct XP
    const { error: xpError } = await supabase
      .from('users')
      .update({ xp: dbUser.xp - SHIELD_COST })
      .eq('id', dbUser.id)

    if (xpError) {
      console.error('XP deduction error:', xpError)
      return NextResponse.json({ error: 'Failed to deduct XP' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      expires_at: expiresAt.toISOString(),
      new_xp: dbUser.xp - SHIELD_COST
    })
  } catch (err: any) {
    console.error('Mental health shield route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}