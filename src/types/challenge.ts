export interface Challenge {
  id: string
  title: string
  description: string
  flag: string
  points: number
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  latitude?: number | null
  longitude?: number | null
  createdAt: Date
  updatedAt: Date
  _count?: {
    solves: number
  }
}

export interface ChallengeWithLocation extends Challenge {
  latitude: number
  longitude: number
}