import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 모든 challenges 조회 (활성/비활성 포함)
    const allChallenges = await prisma.challenge.findMany({
      include: {
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

    // 활성화된 challenges만 조회
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            solves: true
          }
        }
      }
    })

    console.log('=== Challenge Debug Info ===')
    console.log(`Total challenges in DB: ${allChallenges.length}`)
    console.log(`Active challenges: ${activeChallenges.length}`)
    
    allChallenges.forEach((challenge, index) => {
      console.log(`${index + 1}. ${challenge.title} - Active: ${challenge.isActive} - Category: ${challenge.category}`)
    })

    return NextResponse.json({ 
      totalChallenges: allChallenges.length,
      activeChallenges: activeChallenges.length,
      challenges: allChallenges.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        points: c.points,
        isActive: c.isActive,
        createdAt: c.createdAt
      }))
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug info' },
      { status: 500 }
    )
  }
}