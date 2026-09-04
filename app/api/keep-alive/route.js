import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabase'

// Supabase pauses free-tier projects after 7 days with no activity.
// A daily Vercel cron hits this route to keep the database awake.
export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Vercel sends this header on cron invocations; reject anything else
  // if a secret is configured.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // Cheapest possible query: count rows without fetching any.
    const { error } = await supabase
      .from('tas')
      .select('id', { count: 'exact', head: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() })

  } catch (error) {
    console.error('Keep-alive error:', error)
    return NextResponse.json(
      { error: 'Keep-alive query failed' },
      { status: 500 }
    )
  }
}
