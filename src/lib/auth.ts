import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(email: string, username: string, password: string, inviteKey: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  
  // Verify invite key
  const key = await prisma.inviteKey.findUnique({
    where: { key: inviteKey }
  })

  if (!key || key.isUsed) {
    throw new Error('Invalid or already used invite key')
  }

  // Create user and mark key as used in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        score: true,
        createdAt: true,
      },
    })

    await tx.inviteKey.update({
      where: { id: key.id },
      data: {
        isUsed: true,
        usedBy: user.id,
        usedAt: new Date(),
      },
    })

    return user
  })

  return result
}

export async function authenticateUser(emailOrUsername: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
    },
  })

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    score: user.score,
  }
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  return { score, feedback };
}

// CTF Settings utilities
export async function getCtfSettings() {
  try {
    const settings = await prisma.ctfSettings.findFirst()
    return settings
  } catch (error) {
    console.error('Error fetching CTF settings:', error)
    return null
  }
}

export async function isCtfSetup() {
  try {
    const settings = await getCtfSettings()
    return !!settings?.isSetup
  } catch (error) {
    console.error('Error checking CTF setup:', error)
    return false
  }
}