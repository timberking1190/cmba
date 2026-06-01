"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Search } from 'lucide-react'
import { ROLES } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', {ascending:false})
    setUsers(data||[])
  }

  async function updateRole(userId: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    loadUsers()
    setEditUser(null)
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.includes(q)
  })

  const ROLE_COLORS: Record<string,string> = {
    admin:'bg-red-600/20 text-red-400', commissioner:'bg-purple-500/20 text-purple-400',
    coach:'bg-blue-500/20 text-blue-400', referee:'bg-yellow-500/20 text-yellow-400',
    scorekeeper:'bg-green-500/20 text-green-400', parent:'bg-white/8 text-gray-400',
    player:'bg-white/6 text-gray-500', volunteer:'bg-white/6 text-gray-500',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[11px] tracking-[2px] uppercase text-red-500 mb-1">User Management</div>
          <h1 className="font-display text-4xl text-white tracking-wide">Users & Roles</h1>
        </div>
        <div className="font-mono text-xs text-gray-400 tracking-[2px]">{users.length} REGISTERED</div>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, role..."
          className="w-full bg-white/5 border border-white/10 text-sm text-white pl-9 pr-4 py-2.5 outline-none focus:border-red-600/40" />
      </div>

      <div className="border border-white/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-black/30">
              {['Name','Email','Role','Joined','Actions'].map(h => (
                <th key={h} className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 px-5 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                <td className="px-5 py-3 font-medium text-white">{u.full_name || '—'}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-300">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-[11px] px-2 py-1 tracking-[1px] capitalize ${ROLE_COLORS[u.role]||'bg-white/6 text-gray-500'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-[10px] text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => setEditUser(u)}
                    className="font-mono text-[11px] tracking-[1px] px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors">
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={e => {if(e.target===e.currentTarget)setEditUser(null)}}>
          <div className="bg-[#0a0400] border border-white/15 w-96">
            <div className="px-6 py-4 border-b border-white/8">
              <div className="font-display text-lg tracking-wide text-white">Change Role</div>
              <div className="text-xs text-gray-300 mt-1">{editUser.full_name} · {editUser.email}</div>
            </div>
            <div className="p-6 space-y-2">
              {ROLES.map(r => (
                <button key={r.value} onClick={() => updateRole(editUser.id, r.value)}
                  className={`w-full text-left px-4 py-3 border text-sm transition-colors
                    ${editUser.role===r.value ? 'border-red-600/40 bg-red-600/8 text-white' : 'border-white/8 text-gray-400 hover:text-white hover:border-white/20'}`}>
                  {r.label}
                  {editUser.role===r.value && <span className="float-right text-red-500 text-xs">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}