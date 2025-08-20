import { NextResponse } from 'next/server'
import supabase from '../../../lib/supabase'
import { isAuthenticated } from '../../../lib/auth'

// Type definitions
interface TAData {
  id: string
  name: string
  email: string
}

interface HourEntry {
  id: string
  ta_id: string
  date: string
  hours: number
  notes?: string
  paid: boolean
  pay_period: string
  created_at: string
  updated_at: string
  tas: TAData
}

interface PayrollSummary {
  id?: string
  ta_id: string
  pay_period: string
  total_hours: number
  hourly_rate: number
  total_pay: number
  paid: boolean
  paid_date?: string
  created_at?: string
  updated_at?: string
}

interface PayrollData {
  ta_id: string
  ta_name: string
  ta_email: string
  pay_period: string
  total_hours: number
  hourly_rate: number
  total_pay: number
  paid: boolean
  paid_date?: string
  entries: HourEntry[]
  has_new_hours_after_payment: boolean
}

// GET - Fetch payroll summary for current month or specific month
export async function GET(request: Request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const payPeriod = searchParams.get('period') || new Date().toISOString().slice(0, 7)

    // Get hours for the specified pay period
    const { data: hours, error: hoursError } = await supabase
      .from('hours')
      .select(`
        *,
        tas (
          id,
          name,
          email
        )
      `)
      .eq('pay_period', payPeriod)
      .order('created_at', { ascending: false })

    if (hoursError) {
      throw hoursError
    }

    // Get existing payroll summary records
    const { data: existingPayroll, error: payrollError } = await supabase
      .from('payroll_summary')
      .select('*')
      .eq('pay_period', payPeriod)

    if (payrollError) {
      throw payrollError
    }

    // Calculate payroll summary by TA
    const payrollData: Record<string, PayrollData> = (hours as HourEntry[]).reduce((acc, hour) => {
      const taId = hour.ta_id
      if (!acc[taId]) {
        acc[taId] = {
          ta_id: taId,
          ta_name: hour.tas.name,
          ta_email: hour.tas.email,
          pay_period: payPeriod,
          total_hours: 0,
          hourly_rate: 8.00,
          total_pay: 0,
          paid: false,
          entries: [],
          has_new_hours_after_payment: false
        }
      }
      acc[taId].total_hours += hour.hours
      acc[taId].entries.push(hour)
      return acc
    }, {} as Record<string, PayrollData>)

    // Calculate total pay and check payment status
    // In the section where you check for new hours after payment, replace this part:
Object.values(payrollData).forEach((ta: PayrollData) => {
  ta.total_pay = ta.total_hours * ta.hourly_rate
  
  const existing = (existingPayroll as PayrollSummary[])?.find(p => p.ta_id === ta.ta_id)
  if (existing) {
    ta.paid = existing.paid
    ta.paid_date = existing.paid_date || undefined
  
    
    // Replace the warning detection section (around lines 105-125) with this:
// Check if there are new hours after payment date
if (existing.paid_date) { // Remove the paid check - just check if paid_date exists
  const paymentDate = new Date(existing.paid_date)
  
  const hasNewHours = ta.entries.some(entry => {
    const entryDate = new Date(entry.created_at)
    const isAfterPayment = entryDate > paymentDate
    return isAfterPayment
  })
  
  ta.has_new_hours_after_payment = hasNewHours
}
  } else {
    ta.paid = ta.entries.every(entry => entry.paid)
  }
  
})

    const payrollSummary = Object.values(payrollData)

    return NextResponse.json({ 
      payroll: payrollSummary,
      pay_period: payPeriod,
      total_amount: payrollSummary.reduce((sum, ta) => sum + ta.total_pay, 0)
    })

  } catch (error) {
    console.error('Fetch payroll error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll data' },
      { status: 500 }
    )
  }
}

// POST - Mark TA as paid for a specific pay period
export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { ta_id, pay_period, total_hours, total_pay } = await request.json()

    if (!ta_id || !pay_period) {
      return NextResponse.json(
        { error: 'TA ID and pay period are required' },
        { status: 400 }
      )
    }

    // First, check if a payroll record already exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('payroll_summary')
      .select('*')
      .eq('ta_id', ta_id)
      .eq('pay_period', pay_period)
      .single()

    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('payroll_summary')
        .update({
          total_hours,
          hourly_rate: 8.00,
          total_pay,
          paid: true,
          paid_date: new Date().toISOString()
        })
        .eq('ta_id', ta_id)
        .eq('pay_period', pay_period)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('payroll_summary')
        .insert({
          ta_id,
          pay_period,
          total_hours,
          hourly_rate: 8.00,
          total_pay,
          paid: true,
          paid_date: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }
    }

    // Mark all hours for this TA and pay period as paid
    const { error: hoursUpdateError } = await supabase
      .from('hours')
      .update({ paid: true })
      .eq('ta_id', ta_id)
      .eq('pay_period', pay_period)

    if (hoursUpdateError) {
      throw hoursUpdateError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'TA marked as paid successfully'
    })

  } catch (error) {
    console.error('Mark paid error:', error)
    return NextResponse.json(
      { error: 'Failed to mark TA as paid' },
      { status: 500 }
    )
  }
}

// PUT - Undo payment (mark as unpaid)
export async function PUT(request: Request) {
  try {
    const authenticated = await isAuthenticated(request)
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { ta_id, pay_period } = await request.json()

    if (!ta_id || !pay_period) {
      return NextResponse.json(
        { error: 'TA ID and pay period are required' },
        { status: 400 }
      )
    }

    // Update payroll summary record
    const { error: payrollError } = await supabase
      .from('payroll_summary')
      .update({ 
        paid: false, 
        paid_date: null 
      })
      .eq('ta_id', ta_id)
      .eq('pay_period', pay_period)

    if (payrollError) {
      throw payrollError
    }

    // Mark all hours for this TA and pay period as unpaid
    const { error: hoursUpdateError } = await supabase
      .from('hours')
      .update({ paid: false })
      .eq('ta_id', ta_id)
      .eq('pay_period', pay_period)

    if (hoursUpdateError) {
      throw hoursUpdateError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status updated successfully'
    })

  } catch (error) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}