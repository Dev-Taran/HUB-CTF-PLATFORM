import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { inviteKey } = await request.json()

    if (!inviteKey) {
      return NextResponse.json(
        { error: 'Invite key is required' },
        { status: 400 }
      )
    }

    const key = await prisma.inviteKey.findUnique({
      where: { key: inviteKey }
    })

    if (!key) {
      return NextResponse.json(
        { error: 'Invalid invite key' },
        { status: 404 }
      )
    }

    if (key.isUsed) {
      return NextResponse.json(
        { error: 'Invite key has already been used' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Valid invite key' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify invite key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}