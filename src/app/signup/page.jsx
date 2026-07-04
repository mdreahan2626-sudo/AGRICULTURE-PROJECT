'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaf, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password || !name) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful! Welcome aboard.')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0b0f19] px-6">
      
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none animate-pulse" />
      
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Leaf className="w-4.5 h-4.5 text-slate-900" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AgroPredict</span>
        </Link>
      </div>

      <Card className="w-full max-w-md border-white/5 bg-[#0e1626]/80 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1.5 pt-8 px-8">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Sign up to start predicting and tracking crops.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300 text-xs font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10.5 bg-black/25 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition h-11 text-sm rounded-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10.5 bg-black/25 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition h-11 text-sm rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10.5 bg-black/25 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition h-11 text-sm rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-8 pt-6 px-8">
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 font-bold active:scale-[0.99] transition rounded-lg shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:underline font-semibold">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
