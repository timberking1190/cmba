"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Search, Filter, Edit2, AlertTriangle, CheckCircle, Download } from 'lucide-react'
import Papa from 'papaparse'

type GameStatus = 'scheduled'|'live'|'final'|'postponed'|'cancelled'|'forfeit'

export default function ScheduleManager() {
  const [games, setGames] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [filter, setFilter] = useState({ search:'', division:'', status:'' })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [editGame, setEditGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSeasonId, setActiveSeasonId] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadGames() }, [filter])

  async function loadData() {
    const { data: season } = await supabase.from('seasons').select('id').eq('is_active',true).single()
    if (season) setActiveSeasonId(season.id)
    const { data: divs } = await supabase.from('divisions').select('*').order('name')
    setDivisions(divs||[])
    const { data: vs } = await supabase.from('venues').select('*').order('name')
    setVenues(vs||[])
    loadGames()
  }

  async function loadGames() {
    setLoading(true)
    let q = supabase.from('games').select('*, venues(name), division:divisions(name)').order('scheduled_at')
    if (filter.division) q = q.eq('division_id', filter.division)
    if (filter.status) q = q.eq('status', filter.status as GameStatus)
    if (filter.search) q = q.or(`home_team_name.ilike.%${filter.search}%,away_team_name.ilike.%${filter.search}%,court.ilike.%${filter.search}%`)
    const { data } = await q.limit(300)
    setGames(data||[])
    setLoading(false)
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)

    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        let created=0, updated=0, skipped=0, errors: string[]=[]

        for (const row of rows) {
          if (!row['GameNumber'] || !row['Home Team']) { skipped++; continue }
          try {
            // Parse date/time
            const [month,day,year] = (row['Date']||'').split('/')
            const [hour,minute] = (row['Start']||'00:00').split(':')
            const dt = new Date(parseInt(year),parseInt(month)-1,parseInt(day),parseInt(hour),parseInt(minute))
            const [ehour,eminute] = (row['End']||hour+':59').split(':')
            const et = new Date(parseInt(year),parseInt(month)-1,parseInt(day),parseInt(ehour),parseInt(eminute))

            // Upsert venue
            const venueName = (row['Court']||'').trim()
            const venueAbbr = (row['CourtAbbr']||'').trim()
            let venueId: string|null = null
            if (venueName) {
              const { data: vUpsert } = await supabase.from('venues')
                .upsert({ name: venueName, abbreviation: venueAbbr, city: (row['CourtCity']||'Calgary').trim() }, { onConflict:'name' })
                .select('id').single()
              venueId = vUpsert?.id || null
            }

            // Upsert division  
            const divName = (row['Category']||row['Home Division']||'').trim()
            let divisionId: string|null = null
            if (divName && activeSeasonId) {
              const { data: dUpsert } = await supabase.from('divisions')
                .upsert({ name: divName, season_id: activeSeasonId, is_published: true }, { onConflict:'name,season_id' })
                .select('id').single()
              divisionId = dUpsert?.id || null
            }

            // Upsert game
            const gameData = {
              external_id: row['GameNumber'],
              division_id: divisionId,
              venue_id: venueId,
              scheduled_at: dt.toISOString(),
              end_time: et.toISOString(),
              home_team_name: (row['Home Team']||'').trim(),
              away_team_name: (row['Visitor Team']||'').trim(),
              court: venueName,
              court_abbr: venueAbbr,
              game_type: (row['Game Type']||'Regular Season').trim(),
              category: divName,
              home_score: row['Home Score'] ? parseInt(row['Home Score']) : null,
              away_score: row['Visitor Score'] ? parseInt(row['Visitor Score']) : null,
              status: row['Completed']==='true' ? 'final' : 'scheduled',
              notes: (row['Notes']||'').trim() || null,
            }

            const { data: existing } = await supabase.from('games')
              .select('id').eq('external_id', row['GameNumber']).single()
            if (existing) {
              await supabase.from('games').update(gameData).eq('id', existing.id)
              updated++
            } else {
              await supabase.from('games').insert(gameData)
              created++
            }
          } catch(err: any) {
            errors.push(`Row ${row['GameNumber']}: ${err.message}`)
            skipped++
          }
        }

        setImportResult({ created, updated, skipped, errors, total: rows.length })
        setImporting(false)
        loadGames()
      }
    })
  }

  async function saveGameEdit() {
    if (!editGame) return
    await supabase.from('games').update({
      status: editGame.status,
      home_score: editGame.home_score,
      away_score: editGame.away_score,
      notes: editGame.notes,
    }).eq('id', editGame.id)
    setEditGame(null)
    loadGames()
  }

  async function downloadTemplate() {
    const csv = `GameNumber,Season,Game Type,Category,Home Division,Visitor Division,Home SubDivision,Visitor SubDivision,Date,Start,End,Court,CourtAbbr,CourtCity,Home Team,Visitor Team,Home Team Abbr,Visitor Team Abbr,Home Team Display,Visitor Team Display,Home Score,Visitor Score,Completed,OT,SO,Notes\n12345,Winter 2025,Regular Season,Boys U13,Boys U13 Div 1,Boys U13 Div 1,,,1/20/2025,9:00,10:15,Glenmore Christian Academy Court 1,GCA1,Calgary,Bow BU13-1,SoCal BU13-1,,,,,,,,,`
    const blob = new Blob([csv], {type:'text/csv'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='cmba-schedule-template.csv'; a.click()
  }

  const filtered = games.filter(g => {
    if (!filter.search) return true
    const q = filter.search.toLowerCase()
    return g.home_team_name?.toLowerCase().includes(q) || g.away_team_name?.toLowerCase().includes(q) || g.court?.toLowerCase().includes(q)
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[9px] tracking-[3px] uppercase text-red-500 mb-1">Schedule Manager</div>
          <h1 className="font-display text-4xl text-white tracking-wide">Game Schedule</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadTemplate} className="flex items-center gap-2 border border-white/15 text-gray-400 hover:text-white px-4 py-2.5 text-sm transition-colors">
            <Download size={14} /> Template
          </button>
          <button onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 bg-red-600 text-black px-5 py-2.5 font-display text-sm tracking-[2px] hover:bg-red-500 transition-colors disabled:opacity-50">
            <Upload size={14} /> {importing ? 'Importing...' : 'Upload RAMP CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`border p-4 mb-6 flex items-start gap-3 ${importResult.errors.length ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
          {importResult.errors.length ? <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" /> : <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />}
          <div>
            <div className="text-sm text-white font-medium mb-1">
              Import complete: {importResult.created} created · {importResult.updated} updated · {importResult.skipped} skipped
            </div>
            {importResult.errors.slice(0,3).map((e:string,i:number) => (
              <div key={i} className="font-mono text-[10px] text-yellow-400">{e}</div>
            ))}
          </div>
          <button onClick={() => setImportResult(null)} className="ml-auto text-gray-600 hover:text-white text-lg leading-none">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})}
            placeholder="Search teams or venues..."
            className="w-full bg-white/5 border border-white/10 text-sm text-white pl-9 pr-4 py-2.5 outline-none focus:border-red-600/40" />
        </div>
        <select value={filter.division} onChange={e => setFilter({...filter, division: e.target.value})}
          className="bg-[#0a0400] border border-white/10 text-sm text-gray-400 px-3 py-2.5 outline-none">
          <option value="">All Divisions</option>
          {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}
          className="bg-[#0a0400] border border-white/10 text-sm text-gray-400 px-3 py-2.5 outline-none">
          <option value="">All Statuses</option>
          {['scheduled','live','final','postponed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Games table */}
      <div className="border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-black/30">
                {['#','Date & Time','Division','Home Team','Score','Away Team','Venue','Status','Actions'].map(h => (
                  <th key={h} className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 font-mono text-xs text-gray-600 tracking-[2px]">LOADING...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-600 text-sm">No games found. Upload a CSV to get started.</td></tr>
              ) : (
                filtered.map(g => {
                  const dt = new Date(g.scheduled_at)
                  const dateStr = dt.toLocaleDateString('en-CA',{month:'short',day:'numeric'})
                  const timeStr = dt.toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit',hour12:true})
                  return (
                    <tr key={g.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] text-gray-600">{g.external_id}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-red-400 whitespace-nowrap">{dateStr}<br/>{timeStr}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{g.division?.name || g.category}</td>
                      <td className="px-4 py-3 font-medium text-white">{g.home_team_name}</td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {g.status==='final' ? <span className="text-white">{g.home_score} – {g.away_score}</span> : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{g.away_team_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] truncate">{g.venues?.name || g.court}</td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-[9px] px-2 py-1 tracking-[1px]
                          ${g.status==='final'?'bg-green-500/10 text-green-400':g.status==='live'?'bg-red-600/20 text-red-400':g.status==='postponed'?'bg-yellow-500/10 text-yellow-400':'bg-white/5 text-gray-600'}`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditGame({...g})}
                          className="text-gray-600 hover:text-white transition-colors">
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/8 font-mono text-[9px] text-gray-600 tracking-[2px]">
          {filtered.length} GAMES
        </div>
      </div>

      {/* Edit modal */}
      {editGame && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={e => { if(e.target===e.currentTarget) setEditGame(null) }}>
          <div className="bg-[#0a0400] border border-white/15 w-full max-w-md">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="font-display text-lg tracking-wide text-white">Edit Game</div>
              <button onClick={() => setEditGame(null)} className="text-gray-600 hover:text-white text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-400">{editGame.home_team_name} vs {editGame.away_team_name}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Home Score</label>
                  <input type="number" value={editGame.home_score??''} onChange={e => setEditGame({...editGame, home_score: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-center font-display text-xl outline-none focus:border-red-600/40" />
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Away Score</label>
                  <input type="number" value={editGame.away_score??''} onChange={e => setEditGame({...editGame, away_score: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-center font-display text-xl outline-none focus:border-red-600/40" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Status</label>
                <select value={editGame.status} onChange={e => setEditGame({...editGame, status: e.target.value})}
                  className="w-full bg-[#0a0400] border border-white/10 text-white px-3 py-2.5 outline-none">
                  {['scheduled','warmup','live','halftime','final','postponed','cancelled','forfeit'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Notes</label>
                <input value={editGame.notes||''} onChange={e => setEditGame({...editGame, notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm outline-none focus:border-red-600/40"
                  placeholder="Optional..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
              <button onClick={() => setEditGame(null)} className="px-4 py-2 border border-white/10 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={saveGameEdit} className="px-6 py-2 bg-red-600 text-black font-display text-sm tracking-[2px] hover:bg-red-500">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}