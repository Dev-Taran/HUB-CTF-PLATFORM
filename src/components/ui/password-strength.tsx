import React from 'react'
import { checkPasswordStrength } from '@/lib/auth'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score } = checkPasswordStrength(password)
  
  const getStrengthColor = (index: number) => {
    if (index < score) {
      if (score <= 2) return 'bg-red-500'
      if (score <= 3) return 'bg-yellow-500'
      if (score <= 4) return 'bg-blue-500'
      return 'bg-green-500'
    }
    return 'bg-gray-200'
  }

  const getStrengthText = () => {
    if (score === 0) return ''
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
  }

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${getStrengthColor(index)}`}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs text-muted-foreground">
          Password strength: {getStrengthText()}
        </p>
      )}
    </div>
  )
}