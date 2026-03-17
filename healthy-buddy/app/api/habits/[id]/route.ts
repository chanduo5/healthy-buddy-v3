// app/api/habits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  icon:        z.string().optional(),
  color:       z.string().optional(),
  difficulty:  z.enum(['easy','medium','hard']).optional(),
  is_active:   z.boolean().optional(),
  sort_order:  z.number().optional(),
})

async function getDbUser(supabase: any, clerkId: string) {
  const { data } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
  return data
}

// GET /api/habits/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabase()
  const dbUser = await getDbUser(supabase, userId)
  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('habits').select('*').eq('id', params.id).eq('user_id', dbUser.id).single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data })
}

// PATCH /api/habits/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabase = createAdminSupabase()
  const dbUser = await getDbUser(supabase, userId)
  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('habits')
    .update(parsed.data)
    .eq('id', params.id)
    .eq('user_id', dbUser.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/habits/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabase()
  const dbUser = await getDbUser(supabase, userId)
  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft delete (archive instead of destroy)
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', params.id)
    .eq('user_id', dbUser.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: { deleted: true } })
}
