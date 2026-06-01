"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { createClient } from '@/lib/supabase/client'
import { ROLES } from '@/lib/utils'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'parent' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role: form.role } }
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <CourtBackground />
      <div className="relative z-10 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="font-display text-3xl text-white mb-2">Account Created</h2>
        <p className="text-gray-400 mb-6">Check your email to verify your account.</p>
        <Link href="/login" className="font-display tracking-[2px] bg-red-600 text-black px-6 py-3">Sign In →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <CourtBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="border border-white/8 bg-white/2">
          <div className="p-8 border-b border-white/8">
            <img src="/logo.png" alt="CMBA" className="h-10 w-auto mb-5" />
            <h1 className="font-display text-3xl tracking-wide text-white">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Join the CMBA platform</p>
          </div>
          <form onSubmit={handleSignup} className="p-8 space-y-5">
            {[
              { label: 'Full Name', key: 'name', type: 'text', ph: 'Jane Smith' },
              { label: 'Email', key: 'email', type: 'email', ph: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', ph: 'Min. 8 characters' },
            ].map(f => (
              <div key={f.key}>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})} required
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50"
                  placeholder={f.ph} />
              </div>
            ))}
            <div>
              <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">I am a...</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full bg-[#0a0400] border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50">
                {ROLES.filter(r => !['admin','commissioner'].includes(r.value)).map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full font-display text-base tracking-[2px] bg-red-600 text-black py-3.5 hover:bg-red-500 transition-colors disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-red-500 hover:text-red-400">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}