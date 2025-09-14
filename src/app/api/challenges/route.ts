import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('GET /api/challenges called')
    
    // 쿠키에서 토큰 확인
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    
    if (!token) {
      console.log('No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      jwt.verify(token.value, process.env.JWT_SECRET!)
    } catch (error) {
      console.log('Invalid token')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 활성화된 challenges만 가져오기
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            solves: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`Found ${challenges.length} active challenges`)
    challenges.forEach((challenge, index) => {
      console.log(`Challenge ${index + 1}: ${challenge.title} (${challenge.category})`)
    })

    return NextResponse.json({ 
      challenges,
      message: `Found ${challenges.length} challenges`
    })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 토큰 확인
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 관리자만 challenge 생성 가능
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { title, description, category, difficulty, points, flag } = await request.json()

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        difficulty,
        points: parseInt(points),
        flag,
        isActive: true
      }
    })

    console.log('Created new challenge:', challenge.title)

    return NextResponse.json({ 
      challenge,
      message: 'Challenge created successfully'
    })
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}