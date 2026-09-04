import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabase'

// GET - Fetch all TAs
// By default only active TAs are returned (used for hour-entry dropdowns).
// Pass ?includeInactive=true to also get deactivated TAs, for the admin
// management list.
export async function GET(request) {
  try {
    const includeInactive =
      new URL(request.url).searchParams.get('includeInactive') === 'true'

    let query = supabase.from('tas').select('*')

    if (!includeInactive) {
      query = query.eq('active', true)
    } else {
      // Active TAs first, then deactivated ones, alphabetical within each group
      query = query.order('active', { ascending: false })
    }

    const { data: tas, error } = await query.order('name')

    if (error) {
      throw error
    }

    return NextResponse.json({ tas })

  } catch (error) {
    console.error('Fetch TAs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch TAs' },
      { status: 500 }
    )
  }
}