import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Challenge 생성 API
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

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, flag, points, category, difficulty, latitude, longitude } = body;

    // 입력 데이터 검증
    if (!title || !description || !flag || !points || !category || !difficulty) {
      return NextResponse.json({ 
        error: '모든 필드가 필요합니다. (title, description, flag, points, category, difficulty)' 
      }, { status: 400 });
    }

    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json({ error: '포인트는 양의 정수여야 합니다.' }, { status: 400 });
    }

    // 위치 정보 검증 (선택사항이지만 둘 다 있거나 둘 다 없어야 함)
    if ((latitude && !longitude) || (!latitude && longitude)) {
      return NextResponse.json({ 
        error: '위치 정보는 함께 제공되거나 제공되지 않아야 합니다.' 
      }, { status: 400 });
    }

    // Challenge 생성
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        flag,
        points: parseInt(points.toString()),
        category,
        difficulty: difficulty.toUpperCase(),
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
      }
    })

    return NextResponse.json({ 
      message: 'Challenge created successfully', 
      challenge: {
        id: challenge.id,
        title: challenge.title,
        category: challenge.category,
        difficulty: challenge.difficulty,
        points: challenge.points,
        latitude: challenge.latitude,
        longitude: challenge.longitude,
      }
    })  } catch (error) {
    console.error('Challenge 생성 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 모든 challenges 조회 API
export async function GET(request: NextRequest) {
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

    // 일반 사용자는 활성화된 challenge만 볼 수 있음, 관리자는 모든 challenge 볼 수 있음
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

    return NextResponse.json({ challenges }, { status: 200 });

  } catch (error) {
    console.error('Challenge 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
