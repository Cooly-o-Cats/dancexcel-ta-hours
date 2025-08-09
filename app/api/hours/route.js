import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabase'
import { isAuthenticated } from '../../../lib/auth'

// GET - Fetch all hours (admin only)
export async function GET(request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: hours, error } = await supabase
      .from('hours')
      .select(`
        *,
        tas (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Format the data to include TA details
    const formattedHours = hours.map(hour => ({
      ...hour,
      ta_name: hour.tas.name,
      ta_email: hour.tas.email
    }))

    return NextResponse.json({ hours: formattedHours })

  } catch (error) {
    console.error('Fetch hours error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hours' },
      { status: 500 }
    )
  }
}

// POST - Create new hour entry
export async function POST(request) {
  try {
    const { ta_id, date, hours, notes } = await request.json()

    // Basic validation
    if (!ta_id || !date || !hours) {
      return NextResponse.json(
        { error: 'TA, date, and hours are required' },
        { status: 400 }
      )
    }

    if (hours <= 0) {
      return NextResponse.json(
        { error: 'Hours must be greater than 0' },
        { status: 400 }
      )
    }

    // Get TA details for email
    const { data: ta, error: taError } = await supabase
      .from('tas')
      .select('name, email')
      .eq('id', ta_id)
      .single()

    if (taError || !ta) {
      return NextResponse.json(
        { error: 'Invalid TA selected' },
        { status: 400 }
      )
    }

    // Insert hours record
    const { data: hourRecord, error: insertError } = await supabase
      .from('hours')
      .insert([
        {
          ta_id,
          date,
          hours,
          notes: notes || null
        }
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ta_name: ta.name,
          ta_email: ta.email,
          date,
          hours,
          notes
        })
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Hours logged successfully',
      id: hourRecord.id
    })

  } catch (error) {
    console.error('Create hours error:', error)
    return NextResponse.json(
      { error: 'Failed to log hours' },
      { status: 500 }
    )
  }
}

// PUT - Update hour entry (admin only)
export async function PUT(request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, hours, notes } = await request.json()

    if (!id || !hours) {
      return NextResponse.json(
        { error: 'ID and hours are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('hours')
      .update({ hours, notes })
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Hours updated successfully'
    })

  } catch (error) {
    console.error('Update hours error:', error)
    return NextResponse.json(
      { error: 'Failed to update hours' },
      { status: 500 }
    )
  }
}

// DELETE - Delete hour entry (admin only)
export async function DELETE(request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('hours')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Hours deleted successfully'
    })

  } catch (error) {
    console.error('Delete hours error:', error)
    return NextResponse.json(
      { error: 'Failed to delete hours' },
      { status: 500 }
    )
  }
}