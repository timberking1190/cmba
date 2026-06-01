"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Trophy, Users, FileText,
  Megaphone, MapPin, BarChart2, Upload, Target, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { section: 'Schedule' },
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/schedule', icon: Calendar, label: 'Schedule Manager' },
  { href: '/admin/scoring', icon: Target, label: 'Live Scoring' },
  { href: '/admin/standings', icon: Trophy, label: 'Standings' },
  { section: 'Management' },
  { href: '/admin/teams', icon: Users, label: 'Teams & Rosters' },
  { href: '/admin/users', icon: Users, label: 'Users & Roles' },
  { href: '/admin/venues', icon: MapPin, label: 'Venues' },
  { section: 'Communications' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/admin/reports', icon: FileText, label: 'Game Reports', badge: '4' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
]

export function AdminSidebar() {
  const path = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-[#040100]/95 border-r border-white/8 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-white/8">
        <img src="/logo.png" alt="CMBA" className="h-8 w-auto" />
        <div className="mt-2 font-mono text-[11px] tracking-[2px] uppercase text-gray-400">Admin Platform</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((item, i) => {
          if ('section' in item) {
            return <div key={i} className="px-5 py-2 mt-3 font-mono text-[11px] tracking-[2px] uppercase text-gray-400">{item.section}</div>
          }
          const Icon = item.icon
          const isActive = path === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all border-l-2
                ${isActive
                  ? 'text-white border-red-600 bg-red-600/8'
                  : 'text-gray-300 border-transparent hover:text-white hover:bg-white/4'}`}>
              <Icon size={15} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto font-mono text-[11px] bg-red-600 text-black px-1.5 py-0.5">{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/8">
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-400 mb-3">← Public Site</Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-red-600 hover:text-red-400">
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </aside>
  )
}