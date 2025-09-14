'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import Link from 'next/link';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdAt: string;
  flag?: string;
  _count: {
    solves: number;
  };
}

export default function AdminChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
    expert: '전문가',
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/admin/challenges', {
        credentials: 'include', // 쿠키 포함
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Challenge 조회에 실패했습니다.');
      }

      setChallenges(data.challenges);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleChallengeStatus = async (challengeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchChallenges(); // 목록 새로고침
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('상태 변경 실패:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Challenge 목록을 불러오는 중...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Challenge 관리</h1>
            <p className="text-gray-600 mt-2">CTF Challenge를 생성하고 관리하세요.</p>
          </div>
          <Link href="/dashboard/admin/challenges/create">
            <Button>새 Challenge 생성</Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {challenges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">생성된 Challenge가 없습니다.</p>
                <Link href="/dashboard/admin/challenges/create">
                  <Button>첫 번째 Challenge 생성하기</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className={`${!challenge.isActive ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          difficultyColors[challenge.difficulty as keyof typeof difficultyColors]
                        }`}>
                          {difficultyLabels[challenge.difficulty as keyof typeof difficultyLabels]}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {challenge.category}
                        </span>
                        {!challenge.isActive && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            비활성화
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {challenge.description}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">{challenge.points}pts</div>
                      <div className="text-sm text-gray-500">{challenge._count.solves}명 해결</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        <strong>Flag:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{challenge.flag}</code>
                      </div>
                      <div className="text-xs text-gray-500">
                        생성일: {new Date(challenge.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleChallengeStatus(challenge.id, challenge.isActive)}
                      >
                        {challenge.isActive ? '비활성화' : '활성화'}
                      </Button>
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
