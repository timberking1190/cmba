"use client"
import { useState, useEffect } from 'react'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { GameCard } from '@/components/schedule/GameCard'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Filter, Star } from 'lucide-react'

export default function SchedulePage() {
  const [games, setGames] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [filter, setFilter] = useState({ division: '', status: '', view: 'upcoming' })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadData() }, [filter])

  async function loadData() {
    setLoading(true)
    let q = supabase.from('games').select(`
      *, venues(*),
      division:divisions(name,gender,age_group)
    `).order('scheduled_at', { ascending: true }).limit(200)

    if (filter.division) q = q.eq('division_id', filter.division)
    if (filter.status) q = q.eq('status', filter.status)
    if (filter.view === 'tonight') {
      const today = new Date(); today.setHours(0,0,0,0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
      q = q.gte('scheduled_at', today.toISOString()).lt('scheduled_at', tomorrow.toISOString())
    } else if (filter.view === 'upcoming') {
      q = q.gte('scheduled_at', new Date().toISOString()).in('status', ['scheduled','live','warmup'])
    } else if (filter.view === 'results') {
      q = q.eq('status', 'final').order('scheduled_at', {ascending: false}).limit(100)
    }

    const { data } = await q
    setGames(data || [])

    const { data: divs } = await supabase.from('divisions').select('*').eq('is_published', true).order('name')
    setDivisions(divs || [])
    setLoading(false)
  }

  // Group by date
  const grouped = games.reduce((acc, g) => {
    const d = new Date(g.scheduled_at).toLocaleDateString('en-CA', {weekday:'long',month:'long',day:'numeric'})
    if (!acc[d]) acc[d] = []
    acc[d].push(g)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/schedule" />

      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600" />
          <span className="font-mono text-[10px] tracking-[2px] uppercase text-red-500">2025–26 Season</span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,90px)] leading-none tracking-[-1px] text-white mb-8">
          SCHEDULE &<br /><span className="text-red-500">STANDINGS</span>
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:mb-8">
          {[
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'tonight', label: 'Tonight' },
            { key: 'results', label: 'Results' },
            { key: 'all', label: 'All Games' },
          ].map(v => (
            <button key={v.key} onClick={() => setFilter({...filter, view: v.key})}
              className={`font-display text-sm tracking-[2px] px-5 py-2.5 transition-colors
                ${filter.view === v.key ? 'bg-red-600 text-black' : 'border border-white/10 text-gray-400 hover:text-white'}`}>
              {v.label}
            </button>
          ))}
          <select value={filter.division} onChange={e => setFilter({...filter, division: e.target.value})}
            className="bg-[#0a0400] border border-white/10 text-sm text-gray-400 px-4 py-2.5 outline-none hover:border-red-600/30 transition-colors">
            <option value="">All Divisions</option>
            {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Games */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            {loading ? (
              <div className="border border-white/8 p-12 text-center text-gray-400 font-mono text-xs tracking-[2px]">
                LOADING SCHEDULE...
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="border border-white/8 p-12 text-center">
                <Calendar className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-gray-400 font-mono text-xs tracking-[2px] uppercase">No games found</p>
              </div>
            ) : (
              Object.entries(grouped).map(([date, dayGames]) => (
                <div key={date} className="border border-white/8 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-red-600/5 border-b border-white/8">
                    <span className="font-display text-lg tracking-wide text-white">{date}</span>
                    <div className="flex items-center gap-3">
                      {dayGames.some(g => g.status === 'live') && (
                        <span className="font-mono text-[11px] tracking-[2px] text-red-400 flex items-center gap-1.5 animate-live">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
                        </span>
                      )}
                      <span className="font-mono text-[11px] tracking-[2px] text-gray-400">{dayGames.length} GAMES</span>
                    </div>
                  </div>
                  {dayGames.map(g => <GameCard key={g.id} game={g} />)}
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-white/8 p-5">
              <div className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 mb-3">Quick Links</div>
              <a href="/standings" className="flex items-center gap-3 py-2.5 text-sm text-gray-400 hover:text-white border-b border-white/5 last:border-0 transition-colors">
                <Star size={13} className="text-red-500" /> Division Standings →
              </a>
            </div>
            <div className="border border-red-600/20 bg-red-600/4 p-5">
              <div className="font-mono text-[11px] tracking-[2px] uppercase text-red-600 mb-2">Save My Teams</div>
              <p className="text-xs text-gray-400 mb-3">Get notifications for your team's games and scores.</p>
              <a href="/signup" className="font-display text-sm tracking-[2px] bg-red-600 text-black px-4 py-2 inline-block hover:bg-red-500 transition-colors">
                Create Account →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}