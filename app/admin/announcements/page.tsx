"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Megaphone, Pin } from 'lucide-react'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title:'', body:'', category:'general', is_pinned:false, target_roles:['all'] })
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at',{ascending:false})
    setAnnouncements(data||[])
  }

  async function post() {
    const { data: user } = await supabase.auth.getUser()
    await supabase.from('announcements').insert({ ...form, created_by: user.user?.id })
    setForm({ title:'', body:'', category:'general', is_pinned:false, target_roles:['all'] })
    setShowNew(false)
    load()
  }

  async function togglePublish(id:string, current:boolean) {
    await supabase.from('announcements').update({ is_published: !current }).eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[11px] tracking-[2px] uppercase text-red-500 mb-1">Communications</div>
          <h1 className="font-display text-4xl text-white tracking-wide">Announcements</h1>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-red-600 text-black px-5 py-2.5 font-display text-sm tracking-[2px] hover:bg-red-500">
          <Plus size={14} /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className={`border p-5 ${a.is_published ? 'border-white/8' : 'border-white/4 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {a.is_pinned && <Pin size={11} className="text-red-500" />}
                  <span className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400">{a.category}</span>
                  <span className="font-mono text-[11px] text-gray-400">·</span>
                  <span className="font-mono text-[11px] text-gray-400">{new Date(a.published_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}</span>
                </div>
                <h3 className="font-medium text-white mb-1">{a.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{a.body?.slice(0,150)}{a.body?.length>150?'...':''}</p>
              </div>
              <button onClick={() => togglePublish(a.id, a.is_published)}
                className={`ml-4 font-mono text-[11px] tracking-[1px] px-3 py-1.5 border transition-colors
                  ${a.is_published ? 'border-green-500/30 text-green-400 hover:bg-red-600/10 hover:text-red-400 hover:border-red-600/30' : 'border-white/10 text-gray-400 hover:text-green-400 hover:border-green-500/30'}`}>
                {a.is_published ? 'Published' : 'Draft'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={e=>{if(e.target===e.currentTarget)setShowNew(false)}}>
          <div className="bg-[#0a0400] border border-white/15 w-full max-w-lg">
            <div className="px-6 py-4 border-b border-white/8">
              <div className="font-display text-lg tracking-wide text-white">New Announcement</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Title</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm outline-none focus:border-red-600/40"
                  placeholder="Announcement title..." />
              </div>
              <div>
                <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Message</label>
                <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} rows={4}
                  className="w-full bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm outline-none focus:border-red-600/40 resize-none"
                  placeholder="Write your message..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                    className="w-full bg-[#0a0400] border border-white/10 text-white px-3 py-2.5 text-sm outline-none">
                    {['general','schedule','rules','safety','registration','results'].map(c=>(
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_pinned} onChange={e=>setForm({...form,is_pinned:e.target.checked})}
                      className="accent-red-600" />
                    <span className="text-sm text-gray-400">Pin to top</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/8 flex gap-3 justify-end">
              <button onClick={()=>setShowNew(false)} className="px-4 py-2 border border-white/10 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={post} className="px-6 py-2 bg-red-600 text-black font-display text-sm tracking-[2px] hover:bg-red-500">Publish Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}