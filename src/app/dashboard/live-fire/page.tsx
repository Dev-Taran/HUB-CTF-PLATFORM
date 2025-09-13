'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'

interface CtfSettings {
  liveFireEnabled: boolean
}

export default function LiveFirePage() {
  const [ctfSettings, setCtfSettings] = useState<CtfSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkLiveFireAccess()
  }, [])

  const checkLiveFireAccess = async () => {
    try {
      const response = await fetch('/api/setup/status', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (!data.settings?.liveFireEnabled) {
          router.push('/dashboard')
          return
        }
        setCtfSettings(data.settings)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking Live Fire access:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading Live Fire environment...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Live Fire Environment</h1>
            <p className="text-muted-foreground">
              Vulnerable web applications and patch challenges
            </p>
          </div>
        </div>

        {/* Warning Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <CardTitle className="text-orange-800">Important Safety Notice</CardTitle>
                <CardDescription className="text-orange-700">
                  You are entering a Live Fire environment with intentionally vulnerable systems. Please follow all safety guidelines and competition rules.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-orange-700">
            <div className="flex items-start space-x-2">
              <span className="font-medium">•</span>
              <span>Only attack designated targets within the competition scope</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">•</span>
              <span>Do not attempt to access other participants' environments</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">•</span>
              <span>Report any critical vulnerabilities to administrators immediately</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">•</span>
              <span>All activities are monitored and logged for security purposes</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Fire Challenges */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerable Web Applications</CardTitle>
              <CardDescription>
                Exploit and patch real web application vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">SQL Injection Lab</div>
                    <div className="text-sm text-muted-foreground">Find and patch SQL injection vulnerabilities</div>
                  </div>
                  <Button size="sm" disabled>
                    Launch
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">XSS Challenge</div>
                    <div className="text-sm text-muted-foreground">Discover and fix cross-site scripting issues</div>
                  </div>
                  <Button size="sm" disabled>
                    Launch
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Authentication Bypass</div>
                    <div className="text-sm text-muted-foreground">Break and secure authentication mechanisms</div>
                  </div>
                  <Button size="sm" disabled>
                    Launch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Challenges</CardTitle>
              <CardDescription>
                Server misconfigurations and system-level vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Privilege Escalation</div>
                    <div className="text-sm text-muted-foreground">Gain root access and secure the system</div>
                  </div>
                  <Button size="sm" disabled>
                    Launch
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Network Security</div>
                    <div className="text-sm text-muted-foreground">Identify and fix network misconfigurations</div>
                  </div>
                  <Button size="sm" disabled>
                    Launch
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Container Escape</div>
                    <div className="text-sm text-muted-foreground">Break out of containers and secure them</div>
                  </div>
                  <Button size="sm" disabled>
                    Launch
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patch Submission */}
        <Card>
          <CardHeader>
            <CardTitle>Patch Submission Guidelines</CardTitle>
            <CardDescription>
              How to submit your security patches for evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Exploitation Phase</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Document the vulnerability discovery process</li>
                  <li>• Provide proof-of-concept exploit code</li>
                  <li>• Explain the potential impact and risk level</li>
                  <li>• Submit findings through the platform interface</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Patching Phase</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Develop a comprehensive security patch</li>
                  <li>• Test the patch for functionality and security</li>
                  <li>• Document the fix and implementation details</li>
                  <li>• Submit patch files and documentation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium text-blue-800">Scoring Information</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Points are awarded for both successful exploitation and effective patching. 
                    Bonus points are given for elegant solutions and comprehensive documentation.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <svg className="w-16 h-16 mx-auto text-muted-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold">Live Fire Challenges Coming Soon</h3>
                <p className="text-muted-foreground">
                  The Live Fire environment is currently being prepared. 
                  Vulnerable applications and infrastructure challenges will be available shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}