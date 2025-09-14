import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Challenge 수정 API (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { challengeId: string } }
) {
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

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const challengeId = params.challengeId;
    const body = await request.json();

    // Challenge 존재 확인
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Challenge 업데이트
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: body,
    });

    return NextResponse.json({
      message: 'Challenge가 성공적으로 수정되었습니다.',
      challenge: {
        id: updatedChallenge.id,
        title: updatedChallenge.title,
        description: updatedChallenge.description,
        points: updatedChallenge.points,
        category: updatedChallenge.category,
        difficulty: updatedChallenge.difficulty,
        isActive: updatedChallenge.isActive,
        updatedAt: updatedChallenge.updatedAt,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Challenge 수정 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// Challenge 삭제 API (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { challengeId: string } }
) {
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

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const challengeId = params.challengeId;

    // Challenge 존재 확인
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!existingChallenge) {
      return NextResponse.json({ error: 'Challenge를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Challenge 삭제 (관련된 solves도 자동 삭제됨 - cascade)
    await prisma.challenge.delete({
      where: { id: challengeId },
    });

    return NextResponse.json({
      message: 'Challenge가 성공적으로 삭제되었습니다.',
    }, { status: 200 });

  } catch (error) {
    console.error('Challenge 삭제 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
