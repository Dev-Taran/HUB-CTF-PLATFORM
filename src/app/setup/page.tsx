'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordStrength } from '@/components/ui/password-strength'

export default function SetupPage() {
  const [formData, setFormData] = useState({
    ctfName: '',
    ctfDescription: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: '',
    confirmPassword: '',
    adminName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      // Redirect to login page after successful setup
      router.push('/login?message=CTF setup completed! Please login with your admin account.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && (!formData.ctfName || !formData.ctfDescription)) {
      setError('Please fill in CTF information')
      return
    }
    setError('')
    setStep(2)
  }

  const prevStep = () => {
    setError('')
    setStep(1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center">CTF Platform Setup</CardTitle>
          <CardDescription className="text-center">
            Welcome! Let's set up your CTF platform with basic information and create an admin account.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Step indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">CTF Information</span>
              </div>
              <div className="w-8 h-0.5 bg-muted-foreground"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Admin Account</span>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ctfName">CTF Name</Label>
                  <Input
                    id="ctfName"
                    name="ctfName"
                    type="text"
                    placeholder="e.g., CyberSec CTF 2024"
                    value={formData.ctfName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctfDescription">CTF Description</Label>
                  <textarea
                    id="ctfDescription"
                    name="ctfDescription"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your CTF competition..."
                    value={formData.ctfDescription}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Create Admin Account</h3>
                  <p className="text-sm text-muted-foreground">This account will have full access to manage the CTF platform</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      name="adminEmail"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Admin Username</Label>
                    <Input
                      id="adminUsername"
                      name="adminUsername"
                      type="text"
                      placeholder="admin"
                      value={formData.adminUsername}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin Name (Optional)</Label>
                  <Input
                    id="adminName"
                    name="adminName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.adminName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    required
                  />
                  <PasswordStrength password={formData.adminPassword} />
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
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step === 1 ? (
              <div className="w-full flex justify-end">
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              </div>
            ) : (
              <div className="w-full flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}