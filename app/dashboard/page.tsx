"use client"
import { useState, useEffect } from 'react'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, Calendar, Star, User, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [savedTeams, setSavedTeams] = useState<any[]>([])
  const [upcomingGames, setUpcomingGames] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      loadProfile(data.user.id)
    })
  }, [])

  async function loadProfile(uid: string) {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(p)
    const { data: ann } = await supabase.from('announcements')
      .select('*').eq('is_published', true).order('published_at', {ascending:false}).limit(5)
    setAnnouncements(ann || [])
    const { data: games } = await supabase.from('games')
      .select('*, venues(*)')
      .gte('scheduled_at', new Date().toISOString())
      .in('status', ['scheduled','live'])
      .order('scheduled_at').limit(10)
    setUpcomingGames(games || [])
  }

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="font-mono text-xs text-gray-600 tracking-[3px]">LOADING...</div></div>

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar />
      <div className="relative z-10 pt-28 px-8 md:px-14 pb-20">
        <div className="mb-8">
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-red-500 block mb-1">My Dashboard</span>
          <h1 className="font-display text-5xl text-white">Welcome back, {profile.full_name?.split(' ')[0] || 'Friend'}</h1>
          <span className="font-mono text-xs text-gray-600 tracking-[2px] uppercase mt-1 block">{profile.role}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming games */}
          <div className="lg:col-span-2 border border-white/8">
            <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
              <Calendar size={14} className="text-red-500" />
              <span className="font-mono text-[10px] tracking-[2px] uppercase text-gray-400">Upcoming Games</span>
            </div>
            {upcomingGames.length === 0 ? (
              <div className="p-8 text-center text-gray-600 text-sm">No upcoming games scheduled</div>
            ) : (
              upcomingGames.slice(0,5).map(g => (
                <div key={g.id} className="flex items-center gap-4 px-5 py-3 border-b border-white/4 last:border-0">
                  <div className="font-mono text-xs text-red-400 min-w-[90px]">
                    {new Date(g.scheduled_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}
                    {' '}{new Date(g.scheduled_at).toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit',hour12:true})}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{g.home_team_name} vs {g.away_team_name}</div>
                    <div className="text-xs text-gray-600">{g.venues?.name || g.court}</div>
                  </div>
                  <span className="font-mono text-[9px] px-2 py-1 bg-white/6 text-gray-500 tracking-[1px]">{g.category}</span>
                </div>
              ))
            )}
            <div className="px-5 py-3">
              <Link href="/schedule" className="font-mono text-[10px] tracking-[2px] uppercase text-red-500 hover:text-red-400">View Full Schedule →</Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={13} className="text-red-500" />
                <span className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500">My Profile</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="text-white">{profile.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role</span>
                  <span className="text-white capitalize">{profile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="text-white text-xs">{profile.email}</span>
                </div>
              </div>
            </div>

            {announcements.length > 0 && (
              <div className="border border-white/8 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={13} className="text-red-500" />
                  <span className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500">Announcements</span>
                </div>
                {announcements.map(a => (
                  <div key={a.id} className="py-3 border-b border-white/5 last:border-0">
                    <div className="text-sm font-medium text-white mb-1">{a.title}</div>
                    <div className="text-xs text-gray-600">{a.body?.slice(0,80)}{a.body?.length > 80 ? '...' : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}