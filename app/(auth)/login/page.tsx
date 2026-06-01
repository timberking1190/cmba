"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'admin' || profile?.role === 'commissioner') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <CourtBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="border border-white/8 bg-white/2 backdrop-blur-sm">
          <div className="p-8 border-b border-white/8">
            <img src="/logo.png" alt="CMBA" className="h-10 w-auto mb-5" />
            <h1 className="font-display text-3xl tracking-wide text-white">Sign In</h1>
            <p className="text-sm text-gray-500 mt-1">Access your CMBA account</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div>
              <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50 transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50 transition-colors pr-12"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full font-display text-base tracking-[2px] bg-red-600 text-black py-3.5 hover:bg-red-500 transition-colors disabled:opacity-50">
              {loading ? 'Signing In...' : 'Sign In →'}
            </button>
            <p className="text-center text-sm text-gray-600">
              No account?{' '}
              <Link href="/signup" className="text-red-500 hover:text-red-400">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}