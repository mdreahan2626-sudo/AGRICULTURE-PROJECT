import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-replace-in-env-file'
const key = new TextEncoder().encode(JWT_SECRET)

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}
