import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { app as agent } from '../../../../microservices/chat-service/agent.js'

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

    // 3. Query Chat Microservice if URL is provided, otherwise fall back to Serverless execution
    const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL
    
    if (CHAT_SERVICE_URL) {
      const serviceRes = await fetch(`${CHAT_SERVICE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      })

      const serviceData = await serviceRes.json()

      if (!serviceRes.ok) {
        console.error('Microservice Chat Error details:', serviceData)
        throw new Error(serviceData.error || 'Microservice call failed')
      }

      return NextResponse.json({
        message: serviceData.message,
      })
    } else {
      // Serverless execution: invoke LangGraph agent directly
      const langchainMessages = messages.map(msg => {
        if (msg.role === 'assistant') {
          return new AIMessage({ content: msg.content })
        } else {
          return new HumanMessage({ content: msg.content })
        }
      })

      const response = await agent.invoke({
        messages: langchainMessages,
      })

      const lastMessage = response.messages[response.messages.length - 1]
      return NextResponse.json({
        message: lastMessage.content,
      })
    }

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
