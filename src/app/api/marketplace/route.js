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

    // 2. Parse input details
    const { crop, budget, location } = await req.json()
    if (!crop || !budget || !location) {
      return NextResponse.json(
        { error: 'Crop type, budget, and location are required inputs.' },
        { status: 400 }
      )
    }

    // 3. Formulate the system instruction and prompt for Gemini
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = `
You are "AgroMarket Advisor", a smart agricultural supply recommender.
Your purpose is to output a strictly formatted JSON recommendation detailing the best seeds, fertilizers, and mechanical/smart farming tools for a specific crop, within a given budget, for a specified location in India.

The user inputs:
- Crop: ${crop}
- Budget: ₹${budget} per acre
- Location: ${location}

Provide exactly 2 seeds varieties, 2 fertilizers, and 2 tools that are highly recommended for this scenario.
Format your entire response as a raw JSON object matching the following structure:
{
  "seeds": [
    {
      "name": "Seed Variety Name (e.g. Co-86032, Ganga-5)",
      "brand": "Trusted brand name in India",
      "priceEstimate": "Estimated price in INR (e.g. ₹1,200 per acre seed rate)",
      "costNumber": 1200,
      "suitabilityReason": "Short agricultural matching rationale for this crop and location",
      "expectedYieldBoost": "+12% estimated yield boost"
    }
  ],
  "fertilizers": [
    {
      "name": "Fertilizer product (e.g. DAP, Urea, Neem Coated Urea)",
      "brand": "Indian manufacturer (e.g. IFFCO, Chambal)",
      "priceEstimate": "Estimated cost (e.g. ₹350 per 45kg bag)",
      "costNumber": 350,
      "quantityNeeded": "e.g. 2 bags per acre",
      "applicationSchedule": "Timing guidelines (e.g. Basal dose during sowing)",
      "suitabilityReason": "Rationale for why it matches this crop and location"
    }
  ],
  "tools": [
    {
      "name": "Useful mechanical or smart tool (e.g. Drip Nozzles, Knapsack Sprayer, Soil Tester)",
      "priceEstimate": "Estimated cost (e.g. ₹2,200)",
      "costNumber": 2200,
      "description": "Short explanation of the tool utility",
      "utility": "Saves water / reduces labour cost"
    }
  ],
  "summary": {
    "totalSeedsCost": 1200,
    "totalFertilizersCost": 700,
    "combinedEstimate": "₹1,900",
    "budgetStatus": "Within budget / Over budget / Borderline"
  }
}
Do not include any extra text, markdown wrappers, or explanations outside the JSON object. Output raw JSON.
`

    // 4. Query Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Recommend agricultural supplies for: Crop ${crop}, Budget ₹${budget}/acre, Location ${location}.`
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        },
        generationConfig: {
          responseMimeType: 'application/json'
        }
      }),
    })

    const geminiData = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini API Error details:', geminiData)
      throw new Error(geminiData.error?.message || 'Gemini API call failed')
    }

    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    // Parse to ensure it is valid JSON
    let parsedRecommendations
    try {
      parsedRecommendations = JSON.parse(responseText.trim())
    } catch (e) {
      console.error('Failed to parse Gemini JSON response:', responseText)
      throw new Error('AI generated invalid marketplace format. Please try again.')
    }

    return NextResponse.json({ recommendations: parsedRecommendations })

  } catch (error) {
    console.error('Marketplace API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
