"use client"
import { useState, useEffect } from 'react'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { createClient } from '@/lib/supabase/client'

export default function StandingsPage() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [standings, setStandings] = useState<any[]>([])
  const [selDivision, setSelDivision] = useState('')
  const supabase = createClient()

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (selDivision) loadStandings(selDivision) }, [selDivision])

  async function loadData() {
    const { data: divs } = await supabase.from('divisions')
      .select('*, season:seasons(is_active)').eq('is_published', true).order('name')
    const activeDivs = (divs || []).filter((d:any) => d.season?.is_active)
    setDivisions(activeDivs)
    if (activeDivs.length > 0) { setSelDivision(activeDivs[0].id); loadStandings(activeDivs[0].id) }
  }

  async function loadStandings(divId: string) {
    const { data } = await supabase.from('standings').select('*').eq('division_id', divId)
    setStandings(data || [])
  }

  const currentDiv = divisions.find(d => d.id === selDivision)

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/standings" />
      <div className="relative z-10 pt-28 px-8 md:px-14 pb-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600" />
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-red-500">2025–26 Season</span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,90px)] leading-none tracking-[-1px] text-white mb-8">
          DIVISION<br /><span className="text-red-500">STANDINGS</span>
        </h1>

        {/* Division tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {divisions.map(d => (
            <button key={d.id} onClick={() => setSelDivision(d.id)}
              className={`font-mono text-[10px] tracking-[1px] uppercase px-4 py-2.5 border transition-colors
                ${selDivision === d.id
                  ? 'bg-red-600/15 border-red-600/40 text-red-400'
                  : 'border-white/8 text-gray-500 hover:text-white'}`}>
              {d.name}
            </button>
          ))}
        </div>

        {currentDiv && standings.length > 0 ? (
          <StandingsTable standings={standings} title={currentDiv.name} />
        ) : (
          <div className="border border-white/8 p-16 text-center text-gray-600 font-mono text-xs tracking-[2px] uppercase">
            {divisions.length === 0 ? 'No standings available' : 'Select a division'}
          </div>
        )}
      </div>
    </div>
  )
}