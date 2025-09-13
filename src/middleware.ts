import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware triggered for:', request.url) // Debug log
  
  const token = request.cookies.get('token')?.value
  console.log('Token found:', !!token) // Debug log

  if (!token) {
    console.log('No token, redirecting to login') // Debug log
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For now, just let the request pass through
  // Token validation will be done in the API routes
  console.log('Token exists, allowing access') // Debug log
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}