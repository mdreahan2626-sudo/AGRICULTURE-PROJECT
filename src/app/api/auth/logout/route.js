import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Logout successful',
    })

    // Clear token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
