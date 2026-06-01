"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Users, ChevronDown } from 'lucide-react'

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [selDivision, setSelDivision] = useState('')
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeam, setNewTeam] = useState({ name:'', division_id:'', color:'#CC0000' })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadTeams() }, [selDivision])

  async function loadData() {
    const { data: divs } = await supabase.from('divisions').select('*, seasons(is_active)').order('name')
    setDivisions((divs||[]).filter((d:any)=>d.seasons?.is_active))
    const { data: cls } = await supabase.from('clubs').select('*').order('name')
    setClubs(cls||[])
    loadTeams()
  }

  async function loadTeams() {
    let q = supabase.from('teams').select('*, divisions(name), clubs(name,primary_color), players(count)')
    if (selDivision) q = q.eq('division_id', selDivision)
    const { data } = await q.order('name')
    setTeams(data||[])
  }

  async function addTeam() {
    if (!newTeam.name || !newTeam.division_id) return
    await supabase.from('teams').insert(newTeam)
    setNewTeam({ name:'', division_id:'', color:'#CC0000' })
    setShowAddTeam(false)
    loadTeams()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[9px] tracking-[3px] uppercase text-red-500 mb-1">Team Management</div>
          <h1 className="font-display text-4xl text-white tracking-wide">Teams & Rosters</h1>
        </div>
        <button onClick={() => setShowAddTeam(true)}
          className="flex items-center gap-2 bg-red-600 text-black px-5 py-2.5 font-display text-sm tracking-[2px] hover:bg-red-500 transition-colors">
          <Plus size={14} /> Add Team
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setSelDivision('')}
          className={`font-mono text-[10px] tracking-[1px] uppercase px-4 py-2 border transition-colors
            ${!selDivision ? 'bg-red-600/15 border-red-600/40 text-red-400' : 'border-white/8 text-gray-500 hover:text-white'}`}>
          All Divisions
        </button>
        {divisions.map(d => (
          <button key={d.id} onClick={() => setSelDivision(d.id)}
            className={`font-mono text-[10px] tracking-[1px] uppercase px-4 py-2 border transition-colors
              ${selDivision===d.id ? 'bg-red-600/15 border-red-600/40 text-red-400' : 'border-white/8 text-gray-500 hover:text-white'}`}>
            {d.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(t => (
          <div key={t.id} className="border border-white/8 hover:border-red-600/30 transition-colors p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-10 rounded-sm" style={{background: t.color || t.clubs?.primary_color || '#CC0000'}} />
                <div>
                  <div className="font-medium text-white">{t.name}</div>
                  <div className="font-mono text-[10px] text-gray-600 tracking-[1px] mt-0.5">{t.divisions?.name}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users size={11} />
                <span>{t.players?.[0]?.count || 0} players</span>
              </div>
              <button className="font-mono text-[9px] tracking-[1px] px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/25">
                Manage Roster
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddTeam && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={e => {if(e.target===e.currentTarget)setShowAddTeam(false)}}>
          <div className="bg-[#0a0400] border border-white/15 w-96">
            <div className="px-6 py-4 border-b border-white/8">
              <div className="font-display text-lg tracking-wide text-white">Add Team</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Team Name</label>
                <input value={newTeam.name} onChange={e => setNewTeam({...newTeam, name:e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm outline-none focus:border-red-600/40"
                  placeholder="e.g. Bow BU13-4" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Division</label>
                <select value={newTeam.division_id} onChange={e => setNewTeam({...newTeam, division_id:e.target.value})}
                  className="w-full bg-[#0a0400] border border-white/10 text-white px-3 py-2.5 text-sm outline-none">
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase text-gray-500 block mb-2">Team Color</label>
                <div className="flex gap-3 items-center">
                  <input type="color" value={newTeam.color} onChange={e => setNewTeam({...newTeam, color:e.target.value})}
                    className="h-10 w-14 bg-transparent border border-white/10 cursor-pointer" />
                  <span className="font-mono text-xs text-gray-600">{newTeam.color}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
              <button onClick={() => setShowAddTeam(false)} className="px-4 py-2 border border-white/10 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={addTeam} className="px-6 py-2 bg-red-600 text-black font-display text-sm tracking-[2px] hover:bg-red-500">Add Team</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}