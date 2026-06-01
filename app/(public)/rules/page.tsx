"use client"
import { useState, useEffect, useRef } from 'react'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Search, ChevronDown, ChevronRight, BookOpen, AlertCircle } from 'lucide-react'

const CATEGORIES = ['All','Game Structure','Scoring','Fouls','Player Conduct','Eligibility','Substitutions','Equipment']
const DIVISION_MODS = [
  { div:'U13 Girls & Boys', mods:['Size 5 basketball','No 3-point line in Div 5 and below','Jump ball replaced by alternating possession throughout','5-foul limit still applies'] },
  { div:'U15 Girls', mods:['Size 6 basketball','Full 3-point line enforced','3-second rule strictly enforced'] },
  { div:'U15 Boys', mods:['Size 7 basketball','Full 3-point line enforced','24-second shot clock in Div 1–3 only'] },
]

export default function RulesPage() {
  const [rules, setRules]             = useState<any[]>([])
  const [category, setCategory]       = useState('All')
  const [search, setSearch]           = useState('')
  const [expanded, setExpanded]       = useState<Record<string,boolean>>({})
  const [aiQuery, setAiQuery]         = useState('')
  const [aiAnswer, setAiAnswer]       = useState('')
  const [aiError, setAiError]         = useState('')
  const [aiSource, setAiSource]       = useState<'ai'|'search'>('search')
  const [aiLoading, setAiLoading]     = useState(false)
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState<'rules'|'divisions'|'poe'>('rules')
  const [poe, setPoe]                 = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [r, p] = await Promise.all([
      supabase.from('rules').select('*').eq('is_published',true).order('sort_order'),
      supabase.from('points_of_emphasis').select('*').eq('is_published',true).order('sort_order'),
    ])
    setRules(r.data || [])
    setPoe(p.data || [])
    setLoading(false)
  }

  const filtered = rules.filter(r => {
    const matchCat = category === 'All' || r.category === category
    const q = search.toLowerCase()
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q) || r.rule_number?.includes(q)
    return matchCat && matchQ
  })

  const grouped = filtered.reduce((acc,r) => {
    if (!acc[r.category]) acc[r.category]=[]
    acc[r.category].push(r)
    return acc
  }, {} as Record<string,any[]>)

  async function askAI() {
    const q = aiQuery.trim()
    if (!q) return
    setAiLoading(true)
    setAiAnswer('')
    setAiError('')
    try {
      const res = await fetch('/api/rules-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiAnswer(data.answer || 'No answer found.')
      setAiSource(data.source || 'search')
    } catch (err: any) {
      setAiError('Search unavailable. Try again.')
    }
    setAiLoading(false)
  }

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

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/rules" />
      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600"/>
          <span className="font-mono text-[10px] tracking-[2px] uppercase text-red-500">2025–26 Season</span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,90px)] leading-none tracking-[-1px] text-white mb-8">
          RULES<br/><span className="text-red-500">HUB</span>
        </h1>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {([['rules','📖 Rulebook'],['divisions','📐 Division Mods'],['poe','⚡ Points of Emphasis']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`font-display text-sm tracking-[2px] whitespace-nowrap px-5 py-2.5 transition-colors
                ${activeTab===k ? 'bg-red-600 text-black' : 'border border-white/10 text-gray-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* RULEBOOK */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-5">
              {/* AI Search */}
              <div className="border border-red-600/25 bg-red-600/4 p-5">
                <div className="font-mono text-[11px] tracking-[2px] uppercase text-red-500 mb-3 flex items-center gap-2">
                  <span>⚡</span> Ask the Rulebook
                </div>
                <div className="flex gap-3">
                  <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();askAI()} }}
                    placeholder="e.g. How many team fouls before bonus? Can a coach call timeout?"
                    className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-4 py-3 outline-none focus:border-red-600/50" />
                  <button onClick={askAI} disabled={aiLoading}
                    className="font-display text-sm tracking-[2px] bg-red-600 text-black px-5 py-3 hover:bg-red-500 disabled:opacity-50 whitespace-nowrap">
                    {aiLoading ? 'Searching...' : 'Ask →'}
                  </button>
                </div>
                {aiError && (
                  <p className="mt-3 text-sm text-red-400 font-mono">{aiError}</p>
                )}
                {aiAnswer && (
                  <div className="mt-4 p-4 bg-black/30 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 tracking-wider uppercase
                        ${aiSource === 'ai'
                          ? 'bg-red-900/40 text-red-300 border border-red-700/40'
                          : 'bg-white/8 text-slate-400 border border-white/10'}`}>
                        {aiSource === 'ai' ? '⚡ AI Answer' : '🔍 Best Match'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                  </div>
                )}
              </div>

              {/* Text filter */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search rules..."
                  className="w-full bg-white/5 border border-white/10 text-sm text-white pl-9 pr-4 py-3 outline-none focus:border-red-600/40"/>
              </div>

              {/* Rules list */}
              {loading ? (
                <div className="border border-white/8 p-10 text-center font-mono text-xs text-gray-400 tracking-[2px]">LOADING RULES...</div>
              ) : Object.entries(grouped).map(([cat, catRules]) => (
                <div key={cat} className="border border-white/8 overflow-hidden">
                  <div className="px-5 py-3 bg-red-600/5 border-b border-white/8">
                    <span className="font-display text-base tracking-wide text-white">{cat}</span>
                    <span className="ml-2 font-mono text-[11px] text-gray-400 tracking-[1px]">{catRules.length} rules</span>
                  </div>
                  {catRules.map(r => (
                    <div key={r.id} className="border-b border-white/4 last:border-0">
                      <button onClick={() => setExpanded(e=>({...e,[r.id]:!e[r.id]}))}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/3 active:bg-white/5 text-left transition-colors">
                        {expanded[r.id] ? <ChevronDown size={14} className="text-red-500 flex-shrink-0"/> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0"/>}
                        <span className="font-mono text-[10px] text-red-500 min-w-[36px]">{r.rule_number}</span>
                        <span className="font-medium text-white text-sm">{r.title}</span>
                        {r.tags?.slice(0,2).map((t:string) => (
                          <span key={t} className="ml-auto font-mono text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 tracking-[1px] hidden sm:block">{t}</span>
                        ))}
                      </button>
                      {expanded[r.id] && (
                        <div className="px-5 pb-5 pt-1 ml-[52px]">
                          <p className="text-sm text-gray-300 leading-relaxed">{r.body}</p>
                          {r.division_modifications?.length > 0 && (
                            <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/20">
                              <div className="font-mono text-[11px] tracking-[2px] uppercase text-yellow-500 mb-2">Division Modifications</div>
                              {r.division_modifications.map((m:any,i:number) => (
                                <div key={i} className="text-xs text-gray-400">{m}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="border border-white/8 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8 font-mono text-[11px] tracking-[2px] uppercase text-gray-500">Categories</div>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-white/4 last:border-0 transition-colors
                      ${category===c ? 'bg-red-600/10 text-red-400' : 'text-gray-500 hover:text-white hover:bg-white/3'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="border border-white/8 p-4">
                <div className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 mb-3">Quick Links</div>
                <a href="https://basketballalberta.ca" target="_blank" className="text-xs text-red-500 hover:text-red-400 block py-1.5 border-b border-white/5 last:border-0">Basketball Alberta →</a>
                <a href="https://basketball.ca" target="_blank" className="text-xs text-red-500 hover:text-red-400 block py-1.5 border-b border-white/5 last:border-0">Basketball Canada →</a>
                <a href="https://fiba.basketball" target="_blank" className="text-xs text-red-500 hover:text-red-400 block py-1.5">FIBA Official Rules →</a>
              </div>
            </div>
          </div>
        )}

        {/* DIVISION MODIFICATIONS */}
        {activeTab === 'divisions' && (
          <div className="max-w-3xl space-y-4">
            {DIVISION_MODS.map(d => (
              <div key={d.div} className="border border-white/8 overflow-hidden">
                <div className="px-5 py-3 bg-red-600/5 border-b border-white/8">
                  <span className="font-display text-base tracking-wide text-white">{d.div}</span>
                </div>
                <ul className="divide-y divide-white/4">
                  {d.mods.map((m,i) => (
                    <li key={i} className="px-5 py-3.5 flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border border-yellow-500/20 bg-yellow-500/4 p-5">
              <div className="flex gap-2 items-start">
                <AlertCircle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
                <p className="text-xs text-gray-300 leading-relaxed">Division modifications are approved by the CMBA Board at the start of each season and may be updated. If you have questions about a specific division, contact your club representative.</p>
              </div>
            </div>
          </div>
        )}

        {/* POINTS OF EMPHASIS */}
        {activeTab === 'poe' && (
          <div className="max-w-3xl space-y-4">
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">Points of emphasis are directives from CMBA and Basketball Alberta to officials for the current season. These highlight areas where consistent enforcement improves the game experience for all participants.</p>
            {poe.map(p => (
              <div key={p.id} className={`border p-5 ${PRIORITY_STYLE[p.priority]||'border-white/8'}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-lg tracking-wide text-white">{p.title}</h3>
                  <span className={`font-mono text-[11px] px-2 py-1 tracking-[1px] flex-shrink-0 ${PRIORITY_BADGE[p.priority]}`}>
                    {p.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{p.body}</p>
                {p.applies_to?.length > 0 && !p.applies_to.includes('all') && (
                  <div className="mt-3 flex gap-2">
                    {p.applies_to.map((d:string) => (
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