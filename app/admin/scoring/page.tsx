"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ScoringPage() {
  const [games, setGames] = useState<any[]>([])
  const [scores, setScores] = useState<Record<string,{home:string,away:string}>>({})
  const [saving, setSaving] = useState<string|null>(null)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => { loadGames() }, [filter])

  async function loadGames() {
    let q = supabase.from('games').select('*, venues(name), division:divisions(name)').order('scheduled_at')
    if (filter==='pending') q = q.neq('status','final').neq('status','cancelled').neq('status','postponed')
    else if (filter==='today') {
      const today = new Date(); today.setHours(0,0,0,0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1)
      q = q.gte('scheduled_at', today.toISOString()).lt('scheduled_at', tomorrow.toISOString())
    }
    const { data } = await q.limit(200)
    setGames(data||[])
    const s: Record<string,{home:string,away:string}> = {}
    ;(data||[]).forEach((g:any) => { s[g.id]={home:g.home_score??'',away:g.away_score??''} })
    setScores(s)
  }

  async function saveScore(game: any) {
    const s = scores[game.id]
    if (!s || s.home==='' || s.away==='') return
    setSaving(game.id)
    await supabase.from('games').update({
      home_score: parseInt(s.home),
      away_score: parseInt(s.away),
      status: 'final',
    }).eq('id', game.id)
    setSaving(null)
    loadGames()
  }

  async function setLive(gameId: string) {
    await supabase.from('games').update({ status:'live' }).eq('id', gameId)
    loadGames()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[3px] uppercase text-red-500 mb-1">Live Scoring</div>
        <h1 className="font-display text-4xl text-white tracking-wide">Enter Scores</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {[{k:'all',l:'All Games'},{k:'today',l:'Today'},{k:'pending',l:'Needs Score'}].map(v => (
          <button key={v.k} onClick={() => setFilter(v.k)}
            className={`font-display text-sm tracking-[2px] px-5 py-2.5 transition-colors
              ${filter===v.k?'bg-red-600 text-black':'border border-white/10 text-gray-400 hover:text-white'}`}>
            {v.l}
          </button>
        ))}
      </div>

      <div className="border border-white/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-black/30">
              {['Date','Time','Division','Home Team','Home','','Away','Away Team','Venue','Status','Action'].map(h => (
                <th key={h} className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {games.map(g => {
              const dt = new Date(g.scheduled_at)
              const s = scores[g.id] || {home:'',away:''}
              const isSaving = saving===g.id
              return (
                <tr key={g.id} className="border-b border-white/4 hover:bg-white/3">
                  <td className="px-3 py-3 font-mono text-[10px] text-gray-600">
                    {dt.toLocaleDateString('en-CA',{month:'short',day:'numeric'})}
                  </td>
                  <td className="px-3 py-3 font-mono text-[10px] text-red-400">
                    {dt.toLocaleTimeString('en-CA',{hour:'numeric',minute:'2-digit',hour12:true})}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 max-w-[100px] truncate">{g.division?.name||g.category}</td>
                  <td className="px-3 py-3 font-medium text-white">{g.home_team_name}</td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" max="999" value={s.home}
                      onChange={e => setScores({...scores,[g.id]:{...s,home:e.target.value}})}
                      className="w-14 bg-red-600/10 border border-red-600/30 text-red-300 text-center font-display text-lg px-1 py-1.5 outline-none focus:border-red-500"
                      placeholder="—" />
                  </td>
                  <td className="px-1 text-gray-700 text-center">:</td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" max="999" value={s.away}
                      onChange={e => setScores({...scores,[g.id]:{...s,away:e.target.value}})}
                      className="w-14 bg-white/5 border border-white/10 text-gray-200 text-center font-display text-lg px-1 py-1.5 outline-none focus:border-white/30"
                      placeholder="—" />
                  </td>
                  <td className="px-3 py-3 font-medium text-white">{g.away_team_name}</td>
                  <td className="px-3 py-3 text-xs text-gray-600 max-w-[120px] truncate">{g.venues?.name||g.court}</td>
                  <td className="px-3 py-3">
                    <span className={`font-mono text-[9px] px-2 py-1 tracking-[1px]
                      ${g.status==='final'?'bg-green-500/10 text-green-400':g.status==='live'?'bg-red-600/20 text-red-400':'bg-white/5 text-gray-600'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {g.status!=='live' && g.status!=='final' && (
                        <button onClick={() => setLive(g.id)} className="font-mono text-[9px] tracking-[1px] px-2 py-1.5 border border-red-600/30 text-red-500 hover:bg-red-600/10">
                          GO LIVE
                        </button>
                      )}
                      <button onClick={() => saveScore(g)} disabled={isSaving||s.home===''||s.away===''}
                        className="font-mono text-[9px] tracking-[1px] px-3 py-1.5 bg-green-500/15 text-green-400 hover:bg-green-500/25 disabled:opacity-30 disabled:cursor-not-allowed">
                        {isSaving ? '...' : 'SAVE FINAL'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}