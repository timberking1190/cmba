"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'

const NAV_LINKS = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/standings', label: 'Standings' },
  { href: '/rules', label: 'Rules' },
  { href: '/report', label: 'Report' },
]

export function Navbar({ active = '' }: { active?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#040100]/95 backdrop-blur-xl border-b border-white/8' : ''}`}
         style={{ padding: scrolled ? '12px 56px' : '20px 56px' }}>
      <div className="flex items-center justify-between">
        <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity">
          <img src="/logo.png" alt="CMBA" className="h-9 w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link href={link.href}
                className={`text-[11px] tracking-[2px] uppercase transition-colors font-mono
                  ${active === link.href ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-sm bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                  <User size={14} className="text-red-400" />
                </div>
                <span className="font-mono text-xs tracking-wider hidden md:block">
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0400] border border-white/8 shadow-xl">
                  {profile?.role === 'admin' || profile?.role === 'commissioner' ? (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-red-600/10 hover:text-white transition-colors border-b border-white/5">
                      <Settings size={13} /> Admin Dashboard
                    </Link>
                  ) : null}
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5">
                    <User size={13} /> My Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-600/10 transition-colors">
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="font-mono text-xs tracking-[2px] uppercase text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/signup" className="font-display text-sm tracking-[2px] bg-red-600 text-black px-5 py-2.5 hover:bg-red-500 transition-colors">
                Sign Up
              </Link>
            </>
          )}

          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 border-t border-white/8 pt-4 flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="font-mono text-xs tracking-[2px] uppercase text-gray-400 hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}