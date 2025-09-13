import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all invite keys for debugging
    const keys = await prisma.inviteKey.findMany()
    
    return NextResponse.json({
      message: 'Debug: All invite keys',
      keys: keys.map(key => ({
        id: key.id,
        key: key.key,
        isUsed: key.isUsed,
        createdAt: key.createdAt
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Database connection error', details: error.message },
      { status: 500 }
    )
  }
}