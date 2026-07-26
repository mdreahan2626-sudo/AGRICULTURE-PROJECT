'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Leaf, User, LogOut, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error('Failed to fetch user data', err)
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        toast.success('Logged out successfully')
        router.push('/login')
        router.refresh()
      }
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  const navLinks = [
    { href: '/dashboard', label: 'Console Home' },
    { href: '/dashboard/crop', label: 'Crop Suitability' },
    { href: '/dashboard/weather', label: 'Weather Advisor' },
    { href: '/dashboard/disease', label: 'Leaf Clinic' },
    { href: '/dashboard/chat', label: 'AI AgroBot' },
    { href: '/dashboard/health', label: 'Farm Health' },
    { href: '/dashboard/marketplace', label: 'Marketplace' }
  ]

  return (
    <div className="min-h-screen bg-[#080d09] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 agro-header backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <span className="font-bold text-base bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none block">AgroPredict</span>
                <span className="text-[9px] text-emerald-400 font-semibold uppercase leading-none mt-0.5 block">Console</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/10' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{user ? user.name : 'Loading...'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation tab bar */}
      <div className="grid grid-cols-7 lg:hidden border-b border-white/5 bg-[#0e1626]/20 p-2 justify-between">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-center py-2.5 rounded-lg text-[10px] font-bold transition ${
                isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400'
              }`}
            >
              {link.label.split(' ').pop()}
            </Link>
          )
        })}
      </div>

      {/* Main Panel Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-grow w-full flex flex-col justify-start">
        {mounted ? children : (
          <div className="flex-1 flex justify-center items-center py-24 text-xs text-slate-500 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            Initializing AgroPredict console...
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-slate-600 text-xs">
        <p>&copy; {new Date().getFullYear()} AgroPredict Inc. All rights reserved.</p>
      </footer>
    </div>
  )
}
