'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/ui/sidebar'

interface User {
  id: string
  email: string
  username: string
  name?: string
  role: string
  score: number
}

interface CtfSettings {
  name: string
  description: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [ctfSettings, setCtfSettings] = useState<CtfSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    getCtfSettings()
  }, [])

  const getCtfSettings = async () => {
    try {
      const response = await fetch('/api/setup/status')
      const data = await response.json()
      if (data.settings) {
        setCtfSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching CTF settings:', error)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* 상단 네비게이션 바 - 전체 화면 가로 100% */}
      <header className="h-16 shadow-sm flex-shrink-0 w-full" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="flex items-center justify-between h-full px-6">
          <h1 className="text-2xl font-bold text-white">
            {ctfSettings?.name || 'CTF Platform'}
          </h1>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-gray-300">Welcome,</span>
                  <span className="font-medium text-white">{user?.username}</span>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium text-green-400">{user?.score} pts</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="bg-transparent border border-gray-600 text-white hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-sm transition-all duration-200"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 사이드바 */}
        <div className="w-64 shadow-sm flex-shrink-0" style={{ backgroundColor: '#1a1a1a' }}>
          <Sidebar />
        </div>
        
        {/* 메인 컨텐츠 */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: '#0f0f0f' }}>
          <div className="h-full p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}