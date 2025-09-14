import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('GET /api/challenges called')
    
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      console.log('No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    let user
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (error) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch challenges from database
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        points: true,
        category: true,
        difficulty: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        _count: {
          select: {
            solves: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${challenges.length} challenges`)

    return NextResponse.json({ 
      challenges 
    })
  } catch (error) {
    console.error('GET /api/challenges error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch challenges' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/challenges called')
    
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token and check if user is admin
    let user
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, flag, points, category, difficulty } = body

    // Validate required fields
    if (!title || !description || !flag || !points || !category || !difficulty) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create challenge
    const newChallenge = await prisma.challenge.create({
      data: {
        title,
        description,
        flag,
        points,
        category,
        difficulty: difficulty.toUpperCase()
      }
    })
    
    console.log('Created new challenge:', newChallenge.title)

    return NextResponse.json({
      message: 'Challenge created successfully',
      challenge: newChallenge,
    })
  } catch (error) {
    console.error('POST /api/challenges error:', error)
    return NextResponse.json({ 
      error: 'Failed to create challenge' 
    }, { status: 500 })
  }
}