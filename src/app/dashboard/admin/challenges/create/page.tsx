'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LocationPickerMap } from '@/components/ui/location-picker-map';

export default function CreateChallengePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flag: '',
    points: '',
    category: '',
    difficulty: 'EASY',
    location: null as { lat: number; lng: number } | null
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
    { value: 'EASY', label: '쉬움' },
    { value: 'MEDIUM', label: '보통' },
    { value: 'HARD', label: '어려움' },
    { value: 'EXPERT', label: '전문가' },
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
    
    if (currentStep === 1) {
      // 1단계 완료 시 2단계로 이동
      setCurrentStep(2);
      return;
    }

    // 2단계에서 최종 제출
    if (!formData.location) {
      setError('Challenge 위치를 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          points: parseInt(formData.points),
          latitude: formData.location.lat,
          longitude: formData.location.lng,
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

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                1
              </div>
              <div className="text-white font-medium">기본 정보</div>
            </div>
            
            <div className={`h-0.5 flex-1 mx-4 ${
              currentStep >= 2 ? 'bg-cyan-600' : 'bg-gray-600'
            }`}></div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                2
              </div>
              <div className="text-white font-medium">위치 선택</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {currentStep === 1 ? '새 Challenge 생성 - 기본 정보' : '새 Challenge 생성 - 위치 선택'}
            </h1>
            <p className="text-gray-300">
              {currentStep === 1 
                ? '새로운 CTF Challenge의 기본 정보를 입력하세요.' 
                : '지도에서 Challenge가 위치할 곳을 클릭하여 선택하세요.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="glass-card p-4 border border-red-500 border-opacity-50">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {currentStep === 1 ? (
              // 1단계: 기본 정보 입력
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">제목</label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Challenge 제목을 입력하세요"
                    className="glass-input w-full px-3 py-2 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">설명</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Challenge 설명을 입력하세요"
                    className="glass-input w-full px-3 py-2 text-white placeholder-gray-400 h-32 resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Flag</label>
                  <input
                    name="flag"
                    type="text"
                    value={formData.flag}
                    onChange={handleChange}
                    placeholder="HUB{example_flag_here}"
                    className="glass-input w-full px-3 py-2 text-white placeholder-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">포인트</label>
                    <input
                      name="points"
                      type="number"
                      value={formData.points}
                      onChange={handleChange}
                      placeholder="100"
                      min="1"
                      className="glass-input w-full px-3 py-2 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">난이도</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      className="glass-input w-full px-3 py-2 text-white"
                      required
                    >
                      {difficulties.map((diff) => (
                        <option key={diff.value} value={diff.value} className="bg-gray-800">
                          {diff.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">카테고리</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="glass-input w-full px-3 py-2 text-white"
                    required
                  >
                    <option value="" className="bg-gray-800">카테고리를 선택하세요</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              // 2단계: 위치 선택
              <>
                <div className="space-y-4">
                  <div className="glass-card p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Challenge 정보 확인</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">제목:</span>
                        <span className="text-white ml-2">{formData.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">카테고리:</span>
                        <span className="text-white ml-2">{formData.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">난이도:</span>
                        <span className="text-white ml-2">
                          {difficulties.find(d => d.value === formData.difficulty)?.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">포인트:</span>
                        <span className="text-white ml-2">{formData.points}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Challenge 위치 선택
                    </label>
                    <p className="text-xs text-gray-400">
                      지도를 클릭하여 Challenge가 위치할 곳을 선택하세요
                    </p>
                    <LocationPickerMap
                      onLocationSelect={(lat, lng) => {
                        setFormData(prev => ({
                          ...prev,
                          location: { lat, lng }
                        }))
                        setError('') // 위치 선택 시 에러 메시지 제거
                      }}
                      selectedLocation={formData.location}
                    />
                    {formData.location && (
                      <div className="glass-card p-3">
                        <p className="text-sm text-green-400">
                          📍 선택된 위치: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="glass-button flex-1 px-4 py-2 text-white font-medium"
                >
                  이전 단계
                </button>
              )}
              
              <button
                type="button"
                onClick={() => router.back()}
                className="glass-button flex-1 px-4 py-2 text-gray-300 font-medium"
              >
                취소
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="glass-button flex-1 px-4 py-2 text-white font-medium disabled:opacity-50"
              >
                {loading ? '생성 중...' : (currentStep === 1 ? '다음 단계' : 'Challenge 생성')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
