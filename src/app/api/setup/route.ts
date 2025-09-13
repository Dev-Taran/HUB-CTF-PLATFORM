import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { ctfName, ctfDescription, adminEmail, adminUsername, adminPassword, adminName } = await request.json()

    // Validation
    if (!ctfName || !ctfDescription || !adminEmail || !adminUsername || !adminPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if already setup
    let existingSettings = null
    try {
      existingSettings = await prisma.ctfSettings.findFirst()
    } catch (error) {
      console.log('ctfSettings table not found, will create it')
    }

    if (existingSettings?.isSetup) {
      return NextResponse.json(
        { error: 'CTF is already set up' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(adminPassword)

    // Create admin user and CTF settings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user (bypass invite key requirement)
      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          username: adminUsername,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
        },
      })

      // Create or update CTF settings
      const settings = await tx.ctfSettings.upsert({
        where: { id: existingSettings?.id || 'default' },
        update: {
          name: ctfName,
          description: ctfDescription,
          isSetup: true,
        },
        create: {
          id: 'default',
          name: ctfName,
          description: ctfDescription,
          isSetup: true,
        },
      })

      return { admin, settings }
    })

    return NextResponse.json(
      { 
        message: 'CTF setup completed successfully',
        admin: result.admin,
        settings: result.settings
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}