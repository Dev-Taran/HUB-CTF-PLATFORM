'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordStrength } from '@/components/ui/password-strength'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    inviteKey: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteKeyStatus, setInviteKeyStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
    
    // Check invite key in real-time
    if (e.target.name === 'inviteKey' && e.target.value) {
      checkInviteKey(e.target.value)
    } else if (e.target.name === 'inviteKey' && !e.target.value) {
      setInviteKeyStatus('idle')
    }
  }

  const checkInviteKey = async (key: string) => {
    setInviteKeyStatus('checking')
    try {
      const response = await fetch('/api/auth/verify-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteKey: key }),
      })
      
      if (response.ok) {
        setInviteKeyStatus('valid')
      } else {
        setInviteKeyStatus('invalid')
      }
    } catch {
      setInviteKeyStatus('invalid')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          inviteKey: formData.inviteKey,
          name: formData.name || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/login?message=Account created successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your CTF account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="inviteKey">Invite Key</Label>
              <div className="relative">
                <Input
                  id="inviteKey"
                  name="inviteKey"
                  type="text"
                  placeholder="Enter your invite key"
                  value={formData.inviteKey}
                  onChange={handleChange}
                  required
                  className={
                    inviteKeyStatus === 'valid' 
                      ? 'border-green-500 focus:ring-green-500' 
                      : inviteKeyStatus === 'invalid' 
                      ? 'border-red-500 focus:ring-red-500' 
                      : ''
                  }
                />
                {inviteKeyStatus === 'checking' && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
                {inviteKeyStatus === 'valid' && (
                  <div className="absolute right-3 top-3 text-green-500">✓</div>
                )}
                {inviteKeyStatus === 'invalid' && (
                  <div className="absolute right-3 top-3 text-red-500">✗</div>
                )}
              </div>
              {inviteKeyStatus === 'invalid' && (
                <p className="text-xs text-red-500">Invalid or already used invite key</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <PasswordStrength password={formData.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || inviteKeyStatus !== 'valid'}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}