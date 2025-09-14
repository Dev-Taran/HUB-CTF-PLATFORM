'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface User {
  role: string
}

interface CtfSettings {
  liveFireEnabled: boolean
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
  },
  {
    title: 'Challenges',
    href: '/dashboard/challenges',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

const liveFireItem = {
  title: 'Live Fire',
  href: '/dashboard/live-fire',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
}

const otherSidebarItems = [
  {
    title: 'Leaderboard',
    href: '/dashboard/leaderboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'My Submissions',
    href: '/dashboard/submissions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

const adminItems = [
  {
    title: 'Admin Panel',
    href: '/dashboard/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Manage Challenges',
    href: '/dashboard/admin/challenges',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    title: 'Manage Users',
    href: '/dashboard/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    title: 'Invite Keys',
    href: '/dashboard/admin/invite-keys',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [ctfSettings, setCtfSettings] = useState<CtfSettings | null>(null)

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        const [userResponse, settingsResponse] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/setup/status', { credentials: 'include' })
        ])
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setCtfSettings(settingsData.settings)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchUserAndSettings()
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          // Mobile: fixed overlay sidebar
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-200 ease-in-out",
          // Desktop: static sidebar
          "lg:relative lg:top-0 lg:h-full lg:translate-x-0 lg:block",
          // Mobile visibility
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <div className="flex flex-col h-full">
          {/* Header - only show on mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Desktop header */}
          {/* <div className="hidden lg:block p-4 border-b">
            <h2 className="text-lg font-semibold">Navigation</h2>
          </div> */}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-cyan-600 bg-opacity-20 backdrop-blur-sm text-cyan-300"
                        : "text-gray-300 hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-sm hover:text-white"
                    )}
                    onClick={() => {
                      // Close sidebar on mobile when clicking a link
                      if (window.innerWidth < 1024) {
                        onToggle?.()
                      }
                    }}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}

              {/* Live Fire - only show if enabled */}
              {ctfSettings?.liveFireEnabled && (
                <li>
                  <Link
                    href={liveFireItem.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      pathname === liveFireItem.href
                        ? "bg-orange-600 bg-opacity-20 backdrop-blur-sm text-orange-300"
                        : "text-gray-300 hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-sm hover:text-white"
                    )}
                    onClick={() => {
                      // Close sidebar on mobile when clicking a link
                      if (window.innerWidth < 1024) {
                        onToggle?.()
                      }
                    }}
                  >
                    {liveFireItem.icon}
                    <span>{liveFireItem.title}</span>
                  </Link>
                </li>
              )}

              {/* Other navigation items */}
              {otherSidebarItems.map((item, index) => {
                const activeColors = [
                  { bg: 'bg-purple-600', text: 'text-purple-300' },
                  { bg: 'bg-green-600', text: 'text-green-300' },
                  { bg: 'bg-blue-600', text: 'text-blue-300' }
                ]
                const activeColor = activeColors[index]
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        pathname === item.href
                          ? `${activeColor.bg} bg-opacity-20 backdrop-blur-sm ${activeColor.text}`
                          : "text-gray-300 hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-sm hover:text-white"
                      )}
                      onClick={() => {
                        // Close sidebar on mobile when clicking a link
                        if (window.innerWidth < 1024) {
                          onToggle?.()
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}

              {/* Admin Section */}
              {user?.role === 'ADMIN' && (
                <>
                  <li className="pt-4">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Administration
                      </h3>
                    </div>
                  </li>
                  {adminItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                          pathname === item.href
                            ? "bg-red-600 bg-opacity-20 backdrop-blur-sm text-red-300"
                            : "text-gray-300 hover:bg-white hover:bg-opacity-10 hover:backdrop-blur-sm hover:text-white"
                        )}
                        onClick={() => {
                          // Close sidebar on mobile when clicking a link
                          if (window.innerWidth < 1024) {
                            onToggle?.()
                          }
                        }}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4">
            <div className="text-xs text-gray-400 text-center">
              Powered by HUB
            </div>
          </div>
        </div>
      </div>
    </>
  )
}