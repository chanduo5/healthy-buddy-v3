// app/api/habits/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({ ids: z.array(z.string().uuid()) })

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const supabase = createAdminSupabase()
  const { data: dbUser } = await supabase
    .from('users').select('id').eq('clerk_id', userId).single()
  if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update sort_order for each habit
  await Promise.all(
    parsed.data.ids.map((id, index) =>
      supabase.from('habits').update({ sort_order: index }).eq('id', id).eq('user_id', dbUser.id)
    )
  )

  return NextResponse.json({ data: { reordered: true } })
}
