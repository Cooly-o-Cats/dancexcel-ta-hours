import { NextResponse } from 'next/server'
import supabase from '../../../../lib/supabase'
import { isAuthenticated } from '../../../../lib/auth'

// POST - Add new TA (admin only)
export async function POST(request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, email } = await request.json()

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingTA, error: checkError } = await supabase
      .from('tas')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingTA) {
      return NextResponse.json(
        { error: 'A TA with this email already exists' },
        { status: 400 }
      )
    }

    // Insert new TA
    const { data: newTA, error: insertError } = await supabase
      .from('tas')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          active: true
        }
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'TA added successfully',
      ta: newTA
    })

  } catch (error) {
    console.error('Add TA error:', error)
    return NextResponse.json(
      { error: 'Failed to add TA' },
      { status: 500 }
    )
  }
}

// DELETE - Remove TA (admin only)
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
        { error: 'TA ID is required' },
        { status: 400 }
      )
    }

    // Check if TA has any logged hours
    const { data: hoursCount, error: hoursError } = await supabase
      .from('hours')
      .select('id')
      .eq('ta_id', id)
      .limit(1)

    if (hoursError) {
      throw hoursError
    }

    // If TA has hours, deactivate instead of delete
    if (hoursCount && hoursCount.length > 0) {
      const { error: deactivateError } = await supabase
        .from('tas')
        .update({ active: false })
        .eq('id', id)

      if (deactivateError) {
        throw deactivateError
      }

      return NextResponse.json({ 
        success: true, 
        message: 'TA deactivated successfully (has existing hours)',
        deactivated: true
      })
    } else {
      // If no hours, safe to delete
      const { error: deleteError } = await supabase
        .from('tas')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      return NextResponse.json({ 
        success: true, 
        message: 'TA deleted successfully',
        deleted: true
      })
    }

  } catch (error) {
    console.error('Delete TA error:', error)
    return NextResponse.json(
      { error: 'Failed to delete TA' },
      { status: 500 }
    )
  }
}