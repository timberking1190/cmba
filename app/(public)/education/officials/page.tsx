"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink, AlertCircle, Star } from 'lucide-react'

const SIG_CATS = ['All','Violations','Fouls','Scoring','Clock','Administrative']
const PRIORITY_STYLE: Record<string,string> = {
  critical:'border-red-600/40 bg-red-600/5',
  high:'border-yellow-500/30 bg-yellow-500/4',
  normal:'border-white/8 bg-white/2',
}
const PRIORITY_BADGE: Record<string,string> = {
  critical:'bg-red-600/20 text-red-400',
  high:'bg-yellow-500/15 text-yellow-400',
  normal:'bg-white/8 text-gray-500',
}

export default function OfficialsPage() {
  const [tab, setTab]       = useState<'pathway'|'signals'|'poe'>('pathway')
  const [signals, setSignals] = useState<any[]>([])
  const [poe, setPoe]         = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [sigCat, setSigCat]   = useState('All')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from('referee_signals').select('*').eq('is_published',true).order('sort_order'),
      supabase.from('points_of_emphasis').select('*').eq('is_published',true).order('sort_order'),
      supabase.from('education_courses').select('*').eq('type','official').eq('is_active',true).order('sort_order'),
    ]).then(([s,p,c]) => {
      setSignals(s.data||[])
      setPoe(p.data||[])
      setCourses(c.data||[])
      setLoading(false)
    })
  }, [])

  const filteredSignals = sigCat === 'All' ? signals : signals.filter(s => s.category === sigCat)
  const sigGroups = filteredSignals.reduce((a,s) => { if(!a[s.category])a[s.category]=[]; a[s.category].push(s); return a },{} as Record<string,any[]>)

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/education" />
      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        <Link href="/education" className="font-mono text-[10px] tracking-[2px] uppercase text-gray-400 hover:text-red-500 mb-6 block">← Education Hub</Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600"/>
          <span className="font-mono text-[10px] tracking-[2px] uppercase text-red-500">RAMP Pathway</span>
        </div>
        <h1 className="font-display text-[clamp(40px,6vw,80px)] leading-none tracking-[-1px] text-white mb-10">
          OFFICIALS<br/><span className="text-red-500">EDUCATION</span>
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {([['pathway','🎓 RAMP Pathway'],['signals','📋 Signals Guide'],['poe','⚡ Points of Emphasis']] as const).map(([k,l]) => (
            <button key={k} onClick={()=>setTab(k)}
              className={`font-display text-sm tracking-[2px] whitespace-nowrap px-5 py-2.5 transition-colors
                ${tab===k ? 'bg-red-600 text-black' : 'border border-white/10 text-gray-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* RAMP PATHWAY */}
        {tab === 'pathway' && (
          <div>
            {/* Pathway chart */}
            <div className="border border-white/8 p-6 mb-8">
              <div className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 mb-5">RAMP Certification Pathway — Basketball Alberta</div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0">
                {['Level 1 Official','Level 2 Official','Level 3 Official'].map((l,i) => (
                  <div key={i} className="flex items-center">
                    <div className={`border px-5 py-4 ${i===0?'border-red-600/40 bg-red-600/8':'border-white/15 bg-white/3'}`}>
                      <div className="font-mono text-[10px] tracking-[1px] uppercase text-gray-400 mb-1">Level {i+1}</div>
                      <div className="font-display text-sm tracking-wide text-white">{l}</div>
                      <div className="text-xs text-gray-400 mt-1">{['U13 eligible','U15 eligible','Senior eligible'][i]}</div>
                    </div>
                    {i<2 && <div className="hidden sm:block w-8 h-px bg-red-600/40 flex-shrink-0"/>}
                    {i<2 && <div className="sm:hidden w-px h-6 bg-red-600/40 ml-8 my-0.5"/>}
                  </div>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-3 text-center py-10 font-mono text-xs text-gray-400 tracking-[2px]">LOADING...</div>
              ) : courses.map(c => (
                <div key={c.id} className={`border ${c.is_featured?'border-red-600/30':'border-white/8'} bg-white/2 flex flex-col`}>
                  {c.is_featured && (
                    <div className="bg-red-600/15 px-4 py-1.5 border-b border-red-600/20 flex items-center gap-1.5">
                      <Star size={10} className="text-red-400"/><span className="font-mono text-[11px] tracking-[2px] uppercase text-red-400">Required</span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="font-mono text-[11px] text-gray-400 mb-2">
                      {c.format==='online'?'🌐 Online':c.format==='in_person'?'📍 In Person':c.format==='hybrid'?'🔀 Hybrid':'⏸ Self-Paced'}
                    </div>
                    <h3 className="font-display text-lg tracking-wide text-white mb-1">{c.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed flex-1 mb-4">{c.description}</p>
                    {c.certification && <div className="font-mono text-[11px] text-gray-400 mb-3">🏅 {c.certification}</div>}
                    <div className="flex items-center justify-between text-xs mb-4">
                      {c.duration_hours && <span className="text-gray-400">⏱ {c.duration_hours}h</span>}
                      <span className={`font-display text-base ${c.cost_cad===0?'text-green-400':'text-white'}`}>
                        {c.cost_cad===0?'Free':`$${c.cost_cad} CAD`}
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
          </div>
        )}

        {/* SIGNALS GUIDE */}
        {tab === 'signals' && (
          <div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {SIG_CATS.map(c => (
                <button key={c} onClick={()=>setSigCat(c)}
                  className={`font-mono text-[10px] tracking-[1px] uppercase px-4 py-2.5 border whitespace-nowrap transition-colors
                    ${sigCat===c?'bg-red-600/15 border-red-600/40 text-red-400':'border-white/8 text-gray-500 hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-10 font-mono text-xs text-gray-400 tracking-[2px]">LOADING SIGNALS...</div>
            ) : Object.entries(sigGroups).map(([cat, sigs]) => (
              <div key={cat} className="border border-white/8 overflow-hidden mb-4">
                <div className="px-5 py-3 bg-red-600/5 border-b border-white/8">
                  <span className="font-display text-base tracking-wide text-white">{cat}</span>
                </div>
                <div className="divide-y divide-white/4">
                  {sigs.map(s => (
                    <div key={s.id}>
                      <button onClick={()=>setExpanded(expanded===s.id?null:s.id)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 text-left transition-colors">
                        <span className="text-xl w-8 text-center flex-shrink-0">{s.emoji}</span>
                        <span className="font-medium text-white text-sm flex-1">{s.name}</span>
                        <span className="text-xs text-gray-400 hidden sm:block">{s.description}</span>
                        <span className={`font-mono text-[11px] text-gray-400 ml-2 transition-transform ${expanded===s.id?'rotate-90':''}`}>›</span>
                      </button>
                      {expanded===s.id && (
                        <div className="px-5 pb-4 ml-12 space-y-2">
                          <p className="text-sm text-gray-300">{s.description}</p>
                          {s.mechanic && (
                            <div className="border border-white/8 bg-white/2 px-4 py-2.5 inline-block">
                              <div className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 mb-1">Mechanic</div>
                              <div className="text-sm text-gray-200">{s.mechanic}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POINTS OF EMPHASIS */}
        {tab === 'poe' && (
          <div className="max-w-3xl space-y-4">
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              The following points of emphasis have been identified by CMBA and Basketball Alberta for this season. All RAMP-certified officials are expected to apply these directives consistently throughout the season.
            </p>
            {loading ? (
              <div className="text-center py-10 font-mono text-xs text-gray-400 tracking-[2px]">LOADING...</div>
            ) : poe.map(p => (
              <div key={p.id} className={`border p-5 ${PRIORITY_STYLE[p.priority]||'border-white/8'}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-lg tracking-wide text-white">{p.title}</h3>
                  <span className={`font-mono text-[11px] px-2 py-1 tracking-[1px] flex-shrink-0 ${PRIORITY_BADGE[p.priority]}`}>{p.priority}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{p.body}</p>
                {p.applies_to?.length>0 && !p.applies_to.includes('all') && (
                  <div className="mt-3 flex gap-2">
                    {p.applies_to.map((d:string)=>(
                      <span key={d} className="font-mono text-[11px] px-2 py-1 bg-white/5 text-gray-500 tracking-[1px]">{d}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}