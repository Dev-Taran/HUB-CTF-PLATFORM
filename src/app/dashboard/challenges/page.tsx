'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MapboxChallengeMap } from '@/components/ui/mapbox-challenge-map'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Challenge {
  id: string
  title: string
  description: string
  points: number
  category: string
  difficulty: string
  isActive: boolean
  createdAt: string
  latitude?: number
  longitude?: number
  _count: {
    solves: number
  }
}

interface ChallengeModalProps {
  challenge: Challenge | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (challengeId: string, flag: string) => Promise<void>
}

function ChallengeModal({ challenge, isOpen, onClose, onSubmit }: ChallengeModalProps) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !challenge) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;
    
    setLoading(true);
    await onSubmit(challenge.id, flag);
    setLoading(false);
    setFlag('');
  };

  const difficultyLabels = {
    easy: '쉬움',
    medium: '보통', 
    hard: '어려움',
    expert: '전문가',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto text-white">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 glass-card text-blue-300 rounded-full text-xs font-medium">
                  {challenge.category}
                </span>
                <span className="px-2 py-1 glass-card text-gray-300 rounded-full text-xs font-medium">
                  {difficultyLabels[challenge.difficulty as keyof typeof difficultyLabels]}
                </span>
                <span className="text-green-400 font-bold">{challenge.points}pts</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-white mb-2">Description</h3>
            <div className="glass-card p-4">
              <p className="text-gray-200 whitespace-pre-wrap">{challenge.description}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">
              {challenge._count.solves}명이 해결했습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="FLAG{...}"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="glass-input flex-1 px-3 py-2 text-white placeholder-gray-400"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !flag.trim()}
                className="glass-button px-4 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '제출 중...' : '제출'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true)
        console.log('🚀 Starting to fetch challenges...')
        
        const response = await fetch('/api/challenges', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        console.log('📡 Response status:', response.status)
        console.log('📡 Response ok:', response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Raw API response:', data)
          console.log('📦 Challenges array:', data.challenges)
          console.log('📦 Number of challenges:', data.challenges?.length || 0)
          
          if (data.challenges && Array.isArray(data.challenges)) {
            const koreanCities = [
              { lat: 37.5665, lng: 126.9780 }, // 서울
              { lat: 35.1796, lng: 129.0756 }, // 부산
              { lat: 35.8714, lng: 128.6014 }, // 대구
              { lat: 37.4563, lng: 126.7052 }, // 인천
              { lat: 35.1595, lng: 126.8526 }, // 광주
              { lat: 36.3504, lng: 127.3845 }, // 대전
              { lat: 35.5384, lng: 129.3114 }, // 울산
              { lat: 36.5184, lng: 127.7292 }, // 세종
              { lat: 37.2636, lng: 127.0286 }, // 수원
              { lat: 37.8813, lng: 127.7298 }, // 춘천
              { lat: 36.4919, lng: 127.2559 }, // 청주
              { lat: 36.5760, lng: 126.9567 }, // 천안
              { lat: 35.8203, lng: 127.1088 }, // 전주
              { lat: 34.7604, lng: 127.6622 }, // 순천
              { lat: 33.4996, lng: 126.5312 }, // 제주
              { lat: 37.0853, lng: 127.2015 }, // 원주
              { lat: 35.2272, lng: 128.6811 }, // 창원
              { lat: 36.8151, lng: 127.1139 }, // 충주
              { lat: 35.1760, lng: 128.1076 }, // 진주
              { lat: 36.0190, lng: 129.3435 }, // 포항
            ];

            const challengesWithCoords = data.challenges.map((challenge: Challenge, index: number) => {
              const baseCity = koreanCities[index % koreanCities.length];
              
              return {
                ...challenge,
                latitude: baseCity.lat + (Math.random() - 0.5) * 0.3,
                longitude: baseCity.lng + (Math.random() - 0.5) * 0.3,
              };
            });

            console.log('🗺️ Challenges with coordinates:', challengesWithCoords)
            setChallenges(challengesWithCoords)
          } else {
            console.warn('⚠️ No challenges array in response or invalid format')
            setChallenges([])
          }
        } else {
          const errorData = await response.text()
          console.error('❌ Failed to fetch challenges:', response.status, errorData)
          toast.error('Failed to load challenges')
        }
      } catch (error) {
        console.error('💥 Error fetching challenges:', error)
        toast.error('Error loading challenges')
      } finally {
        setLoading(false)
        console.log('✅ Fetch challenges completed')
      }
    }

    fetchChallenges()
  }, [])

  useEffect(() => {
    console.log('🔍 Challenges state updated:', challenges.length, 'challenges')
    challenges.forEach((challenge, index) => {
      console.log(`  ${index + 1}. ${challenge.title} (${challenge.category}) - Active: ${challenge.isActive}`)
    })
  }, [challenges])

  const handleChallengeClick = (challenge: Challenge) => {
    console.log('🎯 Challenge clicked:', challenge.title)
    setSelectedChallenge(challenge)
  }

  const handleFlagSubmit = async (challengeId: string, flag: string) => {
    try {
      console.log('🚩 Submitting flag for challenge:', challengeId)
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          challengeId,
          flag: flag.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Flag submitted successfully!')
        setSelectedChallenge(null)
        
        // Challenge 목록 새로고침
        const updatedResponse = await fetch('/api/challenges', { credentials: 'include' })
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json()
          if (updatedData.challenges) {
            const koreanCities = [
              { lat: 37.5665, lng: 126.9780 }, { lat: 35.1796, lng: 129.0756 },
              { lat: 35.8714, lng: 128.6014 }, { lat: 37.4563, lng: 126.7052 },
              { lat: 35.1595, lng: 126.8526 }, { lat: 36.3504, lng: 127.3845 },
              { lat: 35.5384, lng: 129.3114 }, { lat: 36.5184, lng: 127.7292 },
              { lat: 37.2636, lng: 127.0286 }, { lat: 37.8813, lng: 127.7298 },
              { lat: 36.4919, lng: 127.2559 }, { lat: 36.5760, lng: 126.9567 },
              { lat: 35.8203, lng: 127.1088 }, { lat: 34.7604, lng: 127.6622 },
              { lat: 33.4996, lng: 126.5312 }, { lat: 37.0853, lng: 127.2015 },
              { lat: 35.2272, lng: 128.6811 }, { lat: 36.8151, lng: 127.1139 },
              { lat: 35.1760, lng: 128.1076 }, { lat: 36.0190, lng: 129.3435 },
            ];

            const challengesWithCoords = updatedData.challenges.map((challenge: Challenge, index: number) => {
              const baseCity = koreanCities[index % koreanCities.length];
              return {
                ...challenge,
                latitude: baseCity.lat + (Math.random() - 0.5) * 0.3,
                longitude: baseCity.lng + (Math.random() - 0.5) * 0.3,
              };
            });

            setChallenges(challengesWithCoords)
          }
        }
      } else {
        toast.error(data.message || 'Flag submission failed')
      }
    } catch (error) {
      console.error('Error submitting flag:', error)
      toast.error('Error submitting flag')
    }
  }

  console.log('🗺️ About to render MapboxChallengeMap with:', {
    challengesCount: challenges.length,
    challenges: challenges.map(c => ({ id: c.id, title: c.title, coords: [c.latitude, c.longitude] }))
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="absolute inset-0 -m-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (challenges.length === 0) {
    return (
      <DashboardLayout>
        <div className="absolute inset-0 -m-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">No challenges available</p>
            <p className="text-gray-500">Check with your administrator to add challenges.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="absolute inset-0 -m-6">
        <MapboxChallengeMap 
          challenges={challenges} 
          onChallengeClick={handleChallengeClick}
        />
        
        <ChallengeModal
          challenge={selectedChallenge}
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onSubmit={handleFlagSubmit}
        />
      </div>
    </DashboardLayout>
  )
}
