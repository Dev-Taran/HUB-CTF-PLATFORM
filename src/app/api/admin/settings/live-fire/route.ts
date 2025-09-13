import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
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

    const { enabled } = await request.json()

    // Update Live Fire setting
    const settings = await prisma.ctfSettings.updateMany({
      data: {
        liveFireEnabled: enabled
      }
    })

    // Get updated settings
    const updatedSettings = await prisma.ctfSettings.findFirst()

    return NextResponse.json({
      message: `Live Fire ${enabled ? 'enabled' : 'disabled'} successfully`,
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Live Fire toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}