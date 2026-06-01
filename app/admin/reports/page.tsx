"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Star, Eye } from 'lucide-react'

const STATUS_OPTIONS = ['received','under_review','forwarded_scc','resolved_no_action','resolved_action_taken','dismissed','shared_executive']
const STATUS_COLORS: Record<string,string> = {
  received:'bg-white/8 text-gray-400', under_review:'bg-red-600/15 text-red-400',
  forwarded_scc:'bg-yellow-500/15 text-yellow-400', resolved_no_action:'bg-green-500/15 text-green-400',
  resolved_action_taken:'bg-green-600/20 text-green-300', dismissed:'bg-white/5 text-gray-600',
  shared_executive:'bg-blue-500/15 text-blue-400',
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [selReport, setSelReport] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => { loadReports() }, [filter])

  async function loadReports() {
    let q = supabase.from('game_reports').select('*').order('created_at',{ascending:false})
    if (filter==='concerns') q = q.eq('report_type','concern')
    else if (filter==='compliments') q = q.eq('report_type','compliment')
    else if (filter==='pending') q = q.in('status',['received','under_review'])
    const { data } = await q.limit(100)
    setReports(data||[])
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('game_reports').update({ status, resolved_at: ['resolved_no_action','resolved_action_taken','dismissed','shared_executive'].includes(status) ? new Date().toISOString() : null }).eq('id', id)
    loadReports()
    if (selReport?.id === id) setSelReport({...selReport, status})
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[3px] uppercase text-red-500 mb-1">Sportsmanship & Conduct</div>
        <h1 className="font-display text-4xl text-white tracking-wide">Game Reports</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {[{k:'all',l:'All'},{k:'concerns',l:'Concerns'},{k:'compliments',l:'Compliments'},{k:'pending',l:'Pending'}].map(v => (
          <button key={v.k} onClick={() => setFilter(v.k)}
            className={`font-display text-sm tracking-[2px] px-5 py-2.5 transition-colors
              ${filter===v.k?'bg-red-600 text-black':'border border-white/10 text-gray-400 hover:text-white'}`}>
            {v.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-white/8 overflow-hidden">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-gray-600 text-sm">No reports found</div>
          ) : (
            reports.map(r => (
              <div key={r.id} onClick={() => setSelReport(r)}
                className={`flex items-center gap-4 px-5 py-4 border-b border-white/4 last:border-0 cursor-pointer transition-colors
                  ${selReport?.id===r.id ? 'bg-red-600/8 border-l-2 border-l-red-600' : 'hover:bg-white/3'}`}>
                {r.report_type==='concern'
                  ? <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  : <Star size={14} className="text-yellow-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] text-red-500 mb-0.5">{r.reference_num}</div>
                  <div className="text-sm text-white truncate">
                    {r.report_type==='concern' ? `⚠ ` : `⭐ `}
                    {r.division_name} · {r.home_team} vs {r.away_team}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{r.submitter_name} · {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`font-mono text-[9px] px-2 py-1 tracking-[1px] whitespace-nowrap ${STATUS_COLORS[r.status]||''}`}>
                  {r.status.replace(/_/g,' ')}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Report detail panel */}
        {selReport ? (
          <div className="border border-white/8 p-5">
            <div className="font-mono text-[9px] text-red-500 tracking-[2px] mb-2">{selReport.reference_num}</div>
            <div className="font-display text-lg text-white mb-4">
              {selReport.report_type==='concern' ? '⚠ Concern' : '⭐ Compliment'}
            </div>
            <div className="space-y-3 text-xs mb-5">
              {[
                {l:'Submitted by', v:`${selReport.submitter_name} (${selReport.submitter_role})`},
                {l:'Game Date', v:selReport.game_date},
                {l:'Division', v:selReport.division_name},
                {l:'Matchup', v:`${selReport.home_team} vs ${selReport.away_team}`},
                {l:'Regarding', v:(selReport.reported_parties||[]).join(', ')},
              ].map(f => f.v ? (
                <div key={f.l}>
                  <div className="font-mono text-[9px] tracking-[1px] uppercase text-gray-600 mb-0.5">{f.l}</div>
                  <div className="text-white">{f.v}</div>
                </div>
              ) : null)}
              <div>
                <div className="font-mono text-[9px] tracking-[1px] uppercase text-gray-600 mb-1">Description</div>
                <div className="text-gray-300 leading-relaxed">{selReport.description}</div>
              </div>
            </div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 mb-2">Update Status</div>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => updateStatus(selReport.id, s)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors font-mono tracking-[1px]
                    ${selReport.status===s ? 'bg-red-600/15 text-red-400 border border-red-600/30' : 'border border-white/8 text-gray-500 hover:text-white hover:border-white/20'}`}>
                  {s.replace(/_/g,' ')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-white/8 p-8 flex flex-col items-center justify-center text-center">
            <Eye size={28} className="text-gray-700 mb-3" />
            <p className="text-gray-600 text-sm">Select a report to view details and update status</p>
          </div>
        )}
      </div>
    </div>
  )
}