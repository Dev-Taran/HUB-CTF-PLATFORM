'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function CreateChallengePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flag: '',
    points: '',
    category: '',
    difficulty: 'easy',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Web',
    'Pwn',
    'Reverse',
    'Crypto',
    'Forensics',
    'Misc',
    'OSINT',
    'Stego',
  ];

  const difficulties = [
    { value: 'easy', label: '쉬움' },
    { value: 'medium', label: '보통' },
    { value: 'hard', label: '어려움' },
    { value: 'expert', label: '전문가' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          ...formData,
          points: parseInt(formData.points),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('로그인이 필요합니다.');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Challenge 생성에 실패했습니다.');
      }

      alert('Challenge가 성공적으로 생성되었습니다!');
      router.push('/dashboard/admin/challenges');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>새 Challenge 생성</CardTitle>
            <CardDescription>
              새로운 CTF Challenge를 생성하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Challenge 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Challenge 설명을 입력하세요"
                  className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flag">Flag</Label>
                <Input
                  id="flag"
                  name="flag"
                  type="text"
                  value={formData.flag}
                  onChange={handleChange}
                  placeholder="FLAG{example_flag_here}"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">포인트</Label>
                  <Input
                    id="points"
                    name="points"
                    type="number"
                    value={formData.points}
                    onChange={handleChange}
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">난이도</Label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    {difficulties.map((diff) => (
                      <option key={diff.value} value={diff.value}>
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '생성 중...' : 'Challenge 생성'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
