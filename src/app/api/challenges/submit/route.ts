import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Flag 제출 API
export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const { challengeId, flag } = body;

    if (!challengeId || !flag) {
      return NextResponse.json({ 
        error: 'challengeId와 flag가 필요합니다.' 
      }, { status: 400 });
    }

    // Challenge 조회
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (!challenge.isActive) {
      return NextResponse.json({ error: '비활성화된 Challenge입니다.' }, { status: 400 });
    }

    // 이미 해결했는지 확인
    const existingSolve = await prisma.solve.findUnique({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId: challenge.id,
        },
      },
    });

    if (existingSolve) {
      return NextResponse.json({ error: '이미 해결한 Challenge입니다.' }, { status: 400 });
    }

    // Flag 검증 (대소문자 구분 없이)
    if (flag.trim().toLowerCase() !== challenge.flag.toLowerCase()) {
      return NextResponse.json({ error: '틀린 Flag입니다.' }, { status: 400 });
    }

    // 트랜잭션으로 해결 기록 추가 및 사용자 점수 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 해결 기록 추가
      const solve = await tx.solve.create({
        data: {
          userId: user.id,
          challengeId: challenge.id,
        },
      });

      // 사용자 점수 업데이트
      await tx.user.update({
        where: { id: user.id },
        data: {
          score: {
            increment: challenge.points,
          },
        },
      });

      return solve;
    });

    return NextResponse.json({
      message: '정답입니다! 🎉',
      points: challenge.points,
      totalScore: user.score + challenge.points,
      solveId: result.id,
    }, { status: 200 });

  } catch (error) {
    console.error('Flag 제출 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
