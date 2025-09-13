import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { emailOrUsername, password } = await request.json()

    console.log('Login attempt for:', emailOrUsername) // Debug log

    // Validation
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(emailOrUsername, password)

    if (!user) {
      console.log('Authentication failed for:', emailOrUsername) // Debug log
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Authentication successful for:', user.username) // Debug log

    // Generate token
    const token = generateToken(user.id)

    // Create response with token in cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          score: user.score,
        }
      },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // Make sure cookie is available for all paths
    })

    console.log('Login successful, token set') // Debug log
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}