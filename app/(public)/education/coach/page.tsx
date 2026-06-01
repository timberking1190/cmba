"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Clock, DollarSign, ExternalLink, Star } from 'lucide-react'

const LEVELS = ['All','intro','foundation','advanced','master']
const FORMATS: Record<string,string> = { online:'🌐 Online', in_person:'📍 In Person', hybrid:'🔀 Hybrid', self_paced:'⏸ Self-Paced' }
const LEVEL_BADGE: Record<string,string> = {
  intro:'bg-green-500/15 text-green-400',
  foundation:'bg-blue-500/15 text-blue-400',
  advanced:'bg-purple-500/15 text-purple-400',
  master:'bg-red-600/20 text-red-400',
}

export default function CoachEducationPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [filter, setFilter]   = useState('All')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('education_courses').select('*')
      .eq('type','coach').eq('is_active',true).order('sort_order')
      .then(({ data }) => { setCourses(data||[]); setLoading(false) })
  }, [])

  const filtered = filter === 'All' ? courses : courses.filter(c => c.level === filter)
  const featured = courses.filter(c => c.is_featured)

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/education" />
      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        <Link href="/education" className="font-mono text-[10px] tracking-[2px] uppercase text-gray-600 hover:text-red-500 mb-6 block">← Education Hub</Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600"/>
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-red-500">NCCP Pathways</span>
        </div>
        <h1 className="font-display text-[clamp(40px,6vw,80px)] leading-none tracking-[-1px] text-white mb-2">
          COACH<br/><span className="text-red-500">EDUCATION</span>
        </h1>
        <p className="text-sm text-gray-500 max-w-xl leading-relaxed mb-10">
          All CMBA coaches must hold current NCCP certification appropriate to their level. Mandatory safe sport training is required annually for all coaching staff.
        </p>

        {/* NCCP Pathway visual */}
        <div className="border border-white/8 p-6 mb-8 overflow-x-auto">
          <div className="font-mono text-[9px] tracking-[3px] uppercase text-gray-500 mb-4">NCCP Pathway — Basketball</div>
          <div className="flex items-center gap-0 min-w-max">
            {[
              { label:'Community Sport Intro', level:'Recreational' },
              { label:'Competition Introduction', level:'Competitive' },
              { label:'Competition Development', level:'High Performance' },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="border border-white/15 bg-white/3 px-4 py-3 text-center">
                  <div className="font-mono text-[8px] tracking-[1px] uppercase text-gray-600 mb-1">{s.level}</div>
                  <div className="font-display text-sm tracking-wide text-white whitespace-nowrap">{s.label}</div>
                </div>
                {i < 2 && <div className="w-8 h-px bg-red-600/50 flex-shrink-0"/>}
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory courses banner */}
        <div className="border border-red-600/30 bg-red-600/5 p-5 mb-8 flex flex-col sm:flex-row gap-4 items-start">
          <div className="text-2xl flex-shrink-0">⚠️</div>
          <div>
            <div className="font-mono text-[9px] tracking-[3px] uppercase text-red-500 mb-1">Mandatory for All Coaches</div>
            <p className="text-sm text-gray-300">All CMBA coaches must complete <strong>Speak Out! Sport</strong> and <strong>Making Ethical Decisions</strong> before the season. Coaches without current certification will not be permitted on the bench.</p>
          </div>
        </div>

        {/* Level filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setFilter(l)}
              className={`font-mono text-[10px] tracking-[1px] uppercase px-4 py-2.5 border whitespace-nowrap transition-colors
                ${filter===l ? 'bg-red-600/15 border-red-600/40 text-red-400' : 'border-white/8 text-gray-500 hover:text-white'}`}>
              {l === 'All' ? 'All Levels' : l}
            </button>
          ))}
        </div>

        {/* Course grid */}
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-gray-600 tracking-[2px]">LOADING COURSES...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.id} className={`border ${c.is_featured ? 'border-red-600/30' : 'border-white/8'} bg-white/2 flex flex-col`}>
                {c.is_featured && (
                  <div className="bg-red-600/15 px-4 py-1.5 border-b border-red-600/20 flex items-center gap-1.5">
                    <Star size={10} className="text-red-400"/>
                    <span className="font-mono text-[9px] tracking-[2px] uppercase text-red-400">Required</span>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`font-mono text-[8px] px-2 py-0.5 tracking-[1px] capitalize ${LEVEL_BADGE[c.level]||'bg-white/8 text-gray-500'}`}>{c.level}</span>
                    <span className="font-mono text-[9px] text-gray-600">{FORMATS[c.format]||c.format}</span>
                  </div>
                  <h3 className="font-display text-lg tracking-wide text-white mb-1">{c.title}</h3>
                  {c.subtitle && <div className="font-mono text-[10px] text-red-500 tracking-[1px] mb-2">{c.subtitle}</div>}
                  <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4">{c.description}</p>
                  {c.certification && (
                    <div className="font-mono text-[9px] text-gray-600 mb-3 tracking-[1px]">🏅 {c.certification}</div>
                  )}
                  <div className="flex items-center justify-between text-xs mb-4">
                    {c.duration_hours && (
                      <span className="flex items-center gap-1 text-gray-600"><Clock size={10}/>{c.duration_hours}h</span>
                    )}
                    <span className={`font-display text-base ${c.cost_cad === 0 ? 'text-green-400' : 'text-white'}`}>
                      {c.cost_cad === 0 ? 'Free' : `$${c.cost_cad} CAD`}
                    </span>
                  </div>
                  {c.register_url && (
                    <a href={c.register_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 font-display text-sm tracking-[2px] bg-red-600 text-black py-2.5 hover:bg-red-500 transition-colors">
                      Register <ExternalLink size={12}/>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}