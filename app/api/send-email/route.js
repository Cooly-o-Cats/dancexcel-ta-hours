import { NextResponse } from 'next/server'
import { sendHourConfirmationEmail } from '../../../lib/email'

export async function POST(request) {
  try {
    const { ta_name, ta_email, date, hours, notes } = await request.json()

    // Basic validation
    if (!ta_name || !ta_email || !date || !hours) {
      return NextResponse.json(
        { error: 'Missing required email data' },
        { status: 400 }
      )
    }

    // Send the email
    const result = await sendHourConfirmationEmail({
      ta_name,
      ta_email,
      date,
      hours,
      notes
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully'
      })
    } else {
      throw new Error(result.error)
    }

  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}