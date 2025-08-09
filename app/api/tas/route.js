import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabase'

// GET - Fetch all TAs
export async function GET() {
  try {
    const { data: tas, error } = await supabase
      .from('tas')
      .select('*')
      .eq('active', true)
      .order('name')

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