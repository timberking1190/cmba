"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react'

const NAV_LINKS = [
  { href: '/schedule',  label: 'Schedule',  icon: '📅' },
  { href: '/standings', label: 'Standings', icon: '🏆' },
  { href: '/rules',     label: 'Rules',     icon: '📖' },
  { href: '/report',    label: 'Report',    icon: '📋' },
]

export function Navbar({ active = '' }: { active?: string }) {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [userMenu, setUserMenu]   = useState(false)
  const [user, setUser]           = useState<any>(null)
  const [profile, setProfile]     = useState<any>(null)
  const pathname = usePathname()
  const menuRef  = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  /* Scroll detection */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* Auth */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setUser(s?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  /* Close menus on outside tap/click */
  useEffect(() => {
    const fn = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', fn)
    document.addEventListener('touchstart', fn, { passive: true })
    return () => {
      document.removeEventListener('mousedown', fn)
      document.removeEventListener('touchstart', fn)
    }
  }, [])

  /* Close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); setUserMenu(false) }, [pathname])

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'commissioner'

  return (
    <>
      <nav
        ref={menuRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#040100]/95 backdrop-blur-xl border-b border-white/8' : ''
        }`}
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + ${scrolled ? '12px' : '18px'})` }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-5 md:px-14 pb-3 md:pb-4">
          {/* Logo */}
          <Link href="/" className="flex items-center opacity-90 hover:opacity-100 transition-opacity"
            aria-label="CMBA Home">
            <img src="/logo.png" alt="CMBA" className="h-9 w-auto" loading="eager" />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-mono text-[11px] tracking-[2px] uppercase transition-colors py-2 ${
                    active === link.href || pathname === link.href
                      ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors min-h-[48px] px-2"
                  aria-expanded={userMenu}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-sm bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                    <User size={14} className="text-red-400" />
                  </div>
                  <span className="font-mono text-xs tracking-wider">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={12} className={`transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[#0a0400] border border-white/10 shadow-2xl"
                       role="menu">
                    {isAdmin && (
                      <Link href="/admin" role="menuitem"
                        className="flex items-center gap-2 px-4 py-3.5 text-sm text-gray-300 hover:bg-red-600/10 hover:text-white border-b border-white/5">
                        <Settings size={13} /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/dashboard" role="menuitem"
                      className="flex items-center gap-2 px-4 py-3.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white border-b border-white/5">
                      <User size={13} /> My Dashboard
                    </Link>
                    <button onClick={handleLogout} role="menuitem"
                      className="w-full flex items-center gap-2 px-4 py-3.5 text-sm text-red-400 hover:bg-red-600/10">
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"
                  className="font-mono text-xs tracking-[2px] uppercase text-gray-200 hover:text-white transition-colors min-h-[48px] flex items-center px-2">
                  Login
                </Link>
                <Link href="/signup"
                  className="font-display text-sm tracking-[2px] bg-red-600 text-black px-5 py-2.5 hover:bg-red-500 transition-colors min-h-[48px] flex items-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger — large touch target */}
          <button
            className="md:hidden flex items-center justify-center w-12 h-12 text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-white/8 bg-[#040100]/98 backdrop-blur-xl"
            role="dialog"
            aria-label="Navigation menu"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <ul className="py-2" role="list">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-6 py-4 text-base transition-colors border-b border-white/4 last:border-0 ${
                      pathname === link.href
                        ? 'text-white bg-red-600/8 border-l-2 border-l-red-600'
                        : 'text-gray-200 hover:text-white hover:bg-white/4'
                    }`}
                    aria-current={pathname === link.href ? 'page' : undefined}
                  >
                    <span className="text-xl w-7 text-center">{link.icon}</span>
                    <span className="font-mono text-sm tracking-[2px] uppercase">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile auth section */}
            <div className="px-6 py-4 border-t border-white/8">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 font-mono tracking-[2px] uppercase mb-3">
                    Signed in as {profile?.full_name || user.email}
                  </div>
                  {isAdmin && (
                    <Link href="/admin"
                      className="flex items-center gap-3 py-3.5 text-sm text-gray-300 hover:text-white">
                      <Settings size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <Link href="/dashboard"
                    className="flex items-center gap-3 py-3.5 text-sm text-gray-300 hover:text-white">
                    <User size={15} /> My Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 py-3.5 text-sm text-red-400 w-full">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login"
                    className="flex-1 text-center font-display text-base tracking-[2px] border border-white/15 text-white py-3.5 hover:border-white/30">
                    Login
                  </Link>
                  <Link href="/signup"
                    className="flex-1 text-center font-display text-base tracking-[2px] bg-red-600 text-black py-3.5 hover:bg-red-500">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav — always visible on small screens */}
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              pathname === link.href ? 'text-red-500' : 'text-gray-400'
            }`}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            <span className="font-mono text-[11px] tracking-[1px] uppercase">{link.label}</span>
          </Link>
        ))}
        {user ? (
          <Link href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 ${
              pathname === '/dashboard' ? 'text-red-500' : 'text-gray-400'
            }`}>
            <User size={18} />
            <span className="font-mono text-[11px] tracking-[1px] uppercase">Account</span>
          </Link>
        ) : (
          <Link href="/login"
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-gray-400">
            <User size={18} />
            <span className="font-mono text-[11px] tracking-[1px] uppercase">Login</span>
          </Link>
        )}
      </nav>
    </>
  )
}
