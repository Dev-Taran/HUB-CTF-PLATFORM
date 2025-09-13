import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if the table exists by trying to find settings
    let settings = null
    try {
      settings = await prisma.ctfSettings.findFirst()
    } catch (tableError) {
      console.log('ctfSettings table not found, assuming not setup:', tableError)
      return NextResponse.json({
        isSetup: false,
        settings: null
      })
    }
    
    return NextResponse.json({
      isSetup: !!settings?.isSetup,
      settings: settings || null
    })
  } catch (error) {
    console.error('Check setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}