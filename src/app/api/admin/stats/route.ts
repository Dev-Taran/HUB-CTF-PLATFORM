import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
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

    // Get statistics
    const [totalUsers, totalChallenges, totalSubmissions, activeInviteKeys] = await Promise.all([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.solve.count(),
      prisma.inviteKey.count({
        where: { isUsed: false }
      })
    ])

    const stats = {
      totalUsers,
      totalChallenges,
      totalSubmissions,
      activeInviteKeys
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}