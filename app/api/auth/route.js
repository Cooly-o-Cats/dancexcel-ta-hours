import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createToken } from '../../../lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    // Temporary debug logging (remove after testing)
    console.log('Attempting login with:', { email })
    console.log('Expected admin email:', adminEmail)
    console.log('Admin email exists:', !!adminEmail)
    console.log('Admin password exists:', !!adminPassword)

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if credentials match admin credentials
    if (email !== adminEmail) {
      console.log('Email mismatch:', email, 'vs', adminEmail)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // For simplicity, we're comparing plain text passwords
    // In production, you should hash the admin password
    if (password !== adminPassword) {
      console.log('Password mismatch')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createToken({ 
      email: adminEmail,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    })

    return NextResponse.json({ 
      success: true, 
      token,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}