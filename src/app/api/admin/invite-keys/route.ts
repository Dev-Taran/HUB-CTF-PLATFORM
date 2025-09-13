import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Generate invite key
    const key = randomBytes(16).toString('hex')
    
    const inviteKey = await prisma.inviteKey.create({
      data: { key }
    })

    return NextResponse.json({
      message: 'Invite key created successfully',
      key: inviteKey.key
    })
  } catch (error) {
    console.error('Create invite key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all invite keys
    const inviteKeys = await prisma.inviteKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        key: true,
        isUsed: true,
        usedBy: true,
        createdAt: true,
        usedAt: true,
      }
    })

    return NextResponse.json({ inviteKeys })
  } catch (error) {
    console.error('Get invite keys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}