"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Clock, ExternalLink, Star, AlertTriangle } from 'lucide-react'

const LEVELS = ['All','intro','foundation','advanced','master']
const FORMATS: Record<string,string> = {
  online: '🌐 Online', in_person: '📍 In Person',
  hybrid: '🔀 Hybrid', self_paced: '⏸ Self-Paced'
}
const LEVEL_COLORS: Record<string,string> = {
  intro:      'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
  foundation: 'bg-blue-900/40   text-blue-300   border border-blue-700/50',
  advanced:   'bg-purple-900/40 text-purple-300 border border-purple-700/50',
  master:     'bg-red-900/40    text-red-300    border border-red-700/50',
}

export default function CoachEducationPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [filter, setFilter]   = useState('All')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('education_courses').select('*')
      .eq('type','coach').eq('is_active',true).order('sort_order')
      .then(({ data }) => { setCourses(data || []); setLoading(false) })
  }, [])

  const filtered = filter === 'All' ? courses : courses.filter(c => c.level === filter)

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/education" />

      <main id="main-content" className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link href="/education"
            className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-red-400 transition-colors">
            ← Education Hub
          </Link>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3" aria-hidden="true">
          <div className="w-7 h-px bg-red-600"/>
          <span className="text-label text-red-400">NCCP Pathways</span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,90px)] leading-none tracking-[-1px] text-white mb-4">
          COACH<br/><span className="text-red-500">EDUCATION</span>
        </h1>
        <p className="text-base text-slate-300 max-w-xl leading-relaxed mb-10">
          All CMBA coaches must hold current NCCP certification appropriate to their level.
          Mandatory safe sport training is required annually for all coaching staff.
        </p>

        {/* NCCP Pathway */}
        <section aria-labelledby="pathway-heading" className="border border-white/12 p-6 mb-8">
          <h2 id="pathway-heading" className="text-label text-slate-400 mb-5">NCCP Pathway — Basketball</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-px overflow-x-auto">
            {[
              { label:'Community Sport Intro', level:'Recreational', active: true },
              { label:'Competition Introduction', level:'Competitive', active: false },
              { label:'Competition Development', level:'High Performance', active: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center flex-shrink-0">
                <div className={`px-5 py-4 border ${s.active
                  ? 'border-red-600/50 bg-red-950/40'
                  : 'border-white/12 bg-white/4'}`}>
                  <div className="text-label text-slate-400 mb-1">{s.level}</div>
                  <div className="font-display text-sm tracking-wide text-white">{s.label}</div>
                </div>
                {i < 2 && (
                  <div aria-hidden="true" className="hidden sm:block w-8 h-px bg-red-600/40 flex-shrink-0"/>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Mandatory alert */}
        <div role="alert" className="border border-red-600/40 bg-red-950/30 p-5 mb-8 flex gap-4">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true"/>
          <div>
            <p className="text-sm font-semibold text-red-300 mb-1">Mandatory for All Coaches</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              All CMBA coaches must complete{' '}
              <strong className="text-white">Speak Out! Sport</strong> and{' '}
              <strong className="text-white">Making Ethical Decisions</strong>{' '}
              before the season. Coaches without current certification will not be permitted on the bench.
            </p>
          </div>
        </div>

        {/* Level filter */}
        <div role="tablist" aria-label="Filter by certification level" className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {LEVELS.map(l => (
            <button key={l} role="tab"
              aria-selected={filter === l}
              onClick={() => setFilter(l)}
              className={`text-sm font-medium px-5 py-2.5 border whitespace-nowrap transition-colors min-h-[44px]
                ${filter === l
                  ? 'bg-red-600/20 border-red-600/50 text-red-300'
                  : 'border-white/12 text-slate-300 hover:text-white hover:border-white/25'}`}>
              {l === 'All' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        {/* Course grid */}
        {loading ? (
          <div role="status" className="text-center py-12 text-slate-400" aria-live="polite">
            Loading courses…
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 list-none" aria-label="Available courses">
            {filtered.map(c => (
              <li key={c.id} className={`border flex flex-col ${c.is_featured ? 'border-red-600/40 bg-red-950/15' : 'border-white/12 bg-white/3'}`}>
                {c.is_featured && (
                  <div className="bg-red-900/40 px-4 py-2 border-b border-red-600/30 flex items-center gap-2">
                    <Star size={12} className="text-red-300" aria-hidden="true"/>
                    <span className="text-label text-red-300">Required this season</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 font-medium capitalize rounded-sm ${LEVEL_COLORS[c.level] || 'bg-white/8 text-slate-300'}`}>
                      {c.level}
                    </span>
                    <span className="text-xs text-slate-400">{FORMATS[c.format] || c.format}</span>
                  </div>

                  <h3 className="font-display text-xl tracking-wide text-white mb-1">{c.title}</h3>
                  {c.subtitle && (
                    <p className="text-sm text-red-400 font-medium mb-3">{c.subtitle}</p>
                  )}
                  <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-4">{c.description}</p>

                  {c.certification && (
                    <p className="text-xs text-slate-400 mb-3">
                      <span aria-hidden="true">🏅 </span>
                      <span className="sr-only">Certification: </span>
                      {c.certification}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    {c.duration_hours && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Clock size={13} aria-hidden="true"/>
                        <span>{c.duration_hours} hours</span>
                      </span>
                    )}
                    <span className={`font-display text-xl ${c.cost_cad === 0 ? 'text-emerald-400' : 'text-white'}`}
                          aria-label={c.cost_cad === 0 ? 'Free' : `$${c.cost_cad} Canadian dollars`}>
                      {c.cost_cad === 0 ? 'Free' : `$${c.cost_cad} CAD`}
                    </span>
                  </div>

                  {c.register_url && (
                    <a href={c.register_url} target="_blank" rel="noopener noreferrer"
                      aria-label={`Register for ${c.title} (opens in new tab)`}
                      className="flex items-center justify-center gap-2 font-display text-sm tracking-[2px] bg-red-600 text-black py-3 hover:bg-red-500 transition-colors min-h-[48px]">
                      Register <ExternalLink size={13} aria-hidden="true"/>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
