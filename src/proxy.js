import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

export async function proxy(req) {
  const { pathname } = req.nextUrl
  
  // Get token from cookies
  const token = req.cookies.get('token')?.value

  // Define route types
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/predict')

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if trying to access protected route without token
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      // Redirect to login if token is invalid
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('message', 'session_expired')
      const response = NextResponse.redirect(loginUrl)
      // Clear token cookie
      response.cookies.delete('token')
      return response
    }
  }

  if (isAuthRoute) {
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        // Redirect to dashboard if logged in and trying to access login/signup
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return NextResponse.next()
}

// Config to specify matching routes
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/api/predict/:path*'],
}
