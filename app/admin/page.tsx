"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, Trophy, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminOverview() {
  const [stats, setStats] = useState({ games:0, teams:0, users:0, reports:0, scored:0, pending:0 })
  const [recentGames, setRecentGames] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const [g, t, u, r] = await Promise.all([
      supabase.from('games').select('id,status', {count:'exact'}),
      supabase.from('teams').select('id', {count:'exact'}),
      supabase.from('profiles').select('id', {count:'exact'}),
      supabase.from('game_reports').select('id', {count:'exact'}).eq('status','received'),
    ])
    const scored = (g.data||[]).filter((x:any)=>x.status==='final').length
    setStats({ games:g.count||0, teams:t.count||0, users:u.count||0, reports:r.count||0, scored, pending:(g.count||0)-scored })
    const { data: rg } = await supabase.from('games')
      .select('*, venues(name)').order('scheduled_at',{ascending:false}).limit(8)
    setRecentGames(rg||[])
    const { data: ann } = await supabase.from('announcements')
      .select('*').eq('is_published',true).order('published_at',{ascending:false}).limit(3)
    setAnnouncements(ann||[])
  }

  const STAT_CARDS = [
    { label:'Total Games', val:stats.games, icon:Calendar, color:'text-red-400', link:'/admin/schedule' },
    { label:'Teams', val:stats.teams, icon:Trophy, color:'text-blue-400', link:'/admin/teams' },
    { label:'Registered Users', val:stats.users, icon:Users, color:'text-green-400', link:'/admin/users' },
    { label:'Scores Entered', val:stats.scored, icon:TrendingUp, color:'text-yellow-400', link:'/admin/scoring' },
    { label:'Pending Scores', val:stats.pending, icon:AlertCircle, color:'text-orange-400', link:'/admin/scoring' },
    { label:'Open Reports', val:stats.reports, icon:FileText, color:'text-red-500', link:'/admin/reports' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[3px] uppercase text-red-500 mb-1">Admin Dashboard</div>
        <h1 className="font-display text-4xl text-white tracking-wide">Overview</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(s => (
          <Link key={s.label} href={s.link}
            className="border border-white/8 bg-white/2 p-5 hover:border-red-600/30 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <s.icon size={16} className={s.color} />
              <span className="font-mono text-[9px] tracking-[1px] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
            </div>
            <div className={`font-display text-4xl ${s.color} mb-1`}>{s.val}</div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent games */}
        <div className="border border-white/8">
          <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500">Recent Games</span>
            <Link href="/admin/schedule" className="font-mono text-[9px] text-red-500 tracking-[1px]">View All →</Link>
          </div>
          {recentGames.map(g => (
            <div key={g.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/4 last:border-0">
              <span className={`font-mono text-[9px] px-2 py-1 tracking-[1px]
                ${g.status==='final'?'bg-green-500/10 text-green-400':g.status==='live'?'bg-red-600/20 text-red-400':'bg-white/5 text-gray-600'}`}>
                {g.status}
              </span>
              <div className="flex-1 text-xs text-white truncate">{g.home_team_name} vs {g.away_team_name}</div>
              {g.status==='final' && <span className="font-mono text-xs text-gray-500">{g.home_score}–{g.away_score}</span>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 mb-4">Quick Actions</div>
          {[
            { href:'/admin/schedule', label:'Upload Schedule CSV', desc:'Import RAMP format schedule file', icon:'📤' },
            { href:'/admin/scoring', label:'Enter Game Scores', desc:'Update scores for completed games', icon:'🏀' },
            { href:'/admin/announcements', label:'Post Announcement', desc:'Send message to all members', icon:'📢' },
            { href:'/admin/teams', label:'Manage Teams', desc:'Add teams, coaches, rosters', icon:'👥' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-4 p-4 border border-white/8 hover:border-red-600/30 transition-colors group">
              <span className="text-xl">{a.icon}</span>
              <div>
                <div className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">{a.label}</div>
                <div className="text-xs text-gray-600">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}