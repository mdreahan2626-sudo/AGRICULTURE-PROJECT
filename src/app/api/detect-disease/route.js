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

    // 2. Parse input image
    const { image } = await req.json()
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    const DISEASE_SERVICE_URL = process.env.DISEASE_SERVICE_URL

    if (DISEASE_SERVICE_URL) {
      // Proxy to Disease Microservice
      const serviceRes = await fetch(`${DISEASE_SERVICE_URL}/api/detect-disease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      })

      const serviceData = await serviceRes.json()

      if (!serviceRes.ok) {
        console.error('Microservice Disease Detection Error details:', serviceData)
        throw new Error(serviceData.error || 'Microservice call failed')
      }

      return NextResponse.json(serviceData)
    } else {
      // Serverless execution: call Gemini Vision directly
      // 1. Process base64 data and mime type
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
      let mimeType = 'image/jpeg'
      let base64Data = image

      if (matches && matches.length === 3) {
        mimeType = matches[1]
        base64Data = matches[2]
      }

      // 2. Construct Gemini API call
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY
      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Gemini API key is not configured' },
          { status: 500 }
        )
      }

      const promptText = `
You are a state-of-the-art plant pathology expert AI.
Analyze the uploaded image of a plant leaf and determine if there is a disease.
Provide your response in a strict JSON format matching the schema below.

JSON Schema fields:
- diseaseName: Name of the disease (e.g. "Tomato Late Blight", "Healthy Leaf", "Corn Rust"). If the image is not a plant or leaf, output "Not a plant leaf".
- confidenceScore: Estimated accuracy of diagnosis as a number from 0 to 100.
- severity: Estimated infection level. One of: "Healthy", "Mild", "Moderate", "Severe".
- organicTreatment: Practical organic control recommendation (1-2 sentences).
- chemicalTreatment: Recommended chemical pesticide/fungicide control option (1-2 sentences).
- nearbyPesticide: Advice on what type of pesticide/fungicide formulation to buy at a local store.

Return ONLY the JSON structure. Do not include markdown code block syntax (like \`\`\`json).
`

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
                  text: promptText,
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ],
            },
          ],
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

      // Parse response JSON
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
      const diagnosis = JSON.parse(responseText.trim())

      return NextResponse.json({
        diagnosis,
        message: 'Image disease classification complete'
      })
    }

  } catch (error) {
    console.error('Disease Detection API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
