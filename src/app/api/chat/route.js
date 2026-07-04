import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(req) {
  try {
    // 1. Authenticate user
    const tokenCookie = req.cookies.get('token')
    const token = tokenCookie?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Session token missing' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session token' },
        { status: 401 }
      )
    }

    // 2. Parse input messages
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages history is required' },
        { status: 400 }
      )
    }

    // 3. Format messages history for Gemini API
    // Gemini roles: 'user' and 'model'
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: msg.content
        }
      ]
    }))

    const systemPrompt = `
You are "AgroBot", a friendly, expert AI agricultural consultant.
Your purpose is to answer the farmer's queries about soil, crop health, planting times, crop diseases, organic/chemical treatments, and weather effects.
Speak in a highly supportive, clear, and concise manner.

Language Guidelines:
- You support: English, Hindi (हिंदी), Bengali (বাংলা), Marathi (मराठी), Tamil (தமிழ்), and Telugu (తెలుగు).
- Always respond in the language that the farmer writes or speaks in.
- Keep your answers brief, readable, and easy to follow (maximum 100 words). Use bullet points if necessary.
`

    // 4. Query Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      )
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      }),
    })

    const geminiData = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini API Error details:', geminiData)
      throw new Error(geminiData.error?.message || 'Gemini API call failed')
    }

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({
      message: responseText.trim(),
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
