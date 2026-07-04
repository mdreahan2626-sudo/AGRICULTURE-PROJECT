import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { predictCrop } from '@/lib/predictor'

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

    // 2. Parse and validate inputs
    const { temperature, humidity, moisture, soilType, nitrogen, potassium, phosphorous } = await req.json()

    if (
      temperature === undefined ||
      humidity === undefined ||
      moisture === undefined ||
      !soilType ||
      nitrogen === undefined ||
      potassium === undefined ||
      phosphorous === undefined
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate inputs are numbers where expected
    const parsedTemp = Number(temperature)
    const parsedHumid = Number(humidity)
    const parsedMoist = Number(moisture)
    const parsedN = Number(nitrogen)
    const parsedK = Number(potassium)
    const parsedP = Number(phosphorous)

    if (
      isNaN(parsedTemp) ||
      isNaN(parsedHumid) ||
      isNaN(parsedMoist) ||
      isNaN(parsedN) ||
      isNaN(parsedK) ||
      isNaN(parsedP)
    ) {
      return NextResponse.json(
        { error: 'Numerical fields must contain valid numbers' },
        { status: 400 }
      )
    }

    // 3. Perform prediction
    const predictedCrop = predictCrop({
      temperature: parsedTemp,
      humidity: parsedHumid,
      moisture: parsedMoist,
      soilType,
      nitrogen: parsedN,
      potassium: parsedK,
      phosphorous: parsedP,
    })

    // 4. Save to database
    const predictionRecord = await prisma.cropPrediction.create({
      data: {
        temperature: parsedTemp,
        humidity: parsedHumid,
        moisture: parsedMoist,
        soilType,
        nitrogen: parsedN,
        potassium: parsedK,
        phosphorous: parsedP,
        predictedCrop,
        userId: payload.userId,
      },
    })

    // 5. Return prediction
    return NextResponse.json({
      prediction: predictionRecord,
      message: 'Crop prediction successful',
    })
  } catch (error) {
    console.error('Predict API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
