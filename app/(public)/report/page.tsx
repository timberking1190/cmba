"use client"
import { useState } from 'react'
import Link from 'next/link'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Star, CheckCircle } from 'lucide-react'

type ReportType = 'concern' | 'compliment'

const SUBMITTER_ROLES = ['Parent / Guardian','Coach','Player','Team Manager','Spectator','Official','Volunteer','Other']
const REPORTED_PARTIES = ['Referee / Official','Coach (opposing team)','Coach (my team)','Player (opposing team)','Player (my team)','Spectator','Team Manager','Other']
const OFFICIAL_CATEGORIES = ['Officiating decision','Official conduct / professionalism','Official communication','Rule application','Other']

export default function ReportPage() {
  const [type, setType]             = useState<ReportType | null>(null)
  const [step, setStep]             = useState(1)
  const [submitted, setSubmitted]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [form, setForm]             = useState({
    submitter_name: '', submitter_email: '', submitter_phone: '',
    submitter_role: '', game_date: '', division_name: '',
    home_team: '', away_team: '', venue_name: '',
    reported_parties: [] as string[],
    official_category: '', description: '',
    acknowledged_policy: false,
  })
  const supabase = createClient()

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toggleParty = (p: string) => {
    set('reported_parties', form.reported_parties.includes(p)
      ? form.reported_parties.filter(x => x !== p)
      : [...form.reported_parties, p])
  }

  async function handleSubmit() {
    if (!form.submitter_name || !form.submitter_email || !form.description || !form.acknowledged_policy) {
      setError('Please complete all required fields and acknowledge the submission policy.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.from('game_reports').insert({
      report_type: type,
      submitter_name: form.submitter_name,
      submitter_email: form.submitter_email,
      submitter_role: form.submitter_role,
      game_date: form.game_date || null,
      division_name: form.division_name,
      home_team: form.home_team,
      away_team: form.away_team,
      venue_name: form.venue_name,
      reported_parties: form.reported_parties,
      description: form.description,
      status: 'received',
    })
    if (err) { setError('Submission failed. Please try again.'); setSubmitting(false); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar />
      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
        <CheckCircle size={56} className="text-green-400 mb-6" />
        <h1 className="font-display text-4xl md:text-5xl text-white mb-3 text-center">Report Received</h1>
        <p className="text-gray-400 text-center max-w-md leading-relaxed mb-8">
          {type === 'concern'
            ? 'Your report has been submitted and assigned a reference number. A CMBA representative will review it within 48–72 hours. Check your email for a confirmation.'
            : 'Thank you for taking the time to recognize great work. Your compliment will be shared with the appropriate parties.'}
        </p>
        <Link href="/" className="font-display text-sm tracking-[2px] bg-red-600 text-black px-8 py-3.5 hover:bg-red-500 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/report" />
      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600"/>
          <span className="font-mono text-[10px] tracking-[2px] uppercase text-red-500">Sportsmanship & Conduct</span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,90px)] leading-none tracking-[-1px] text-white mb-8">
          GAME<br/><span className="text-red-500">REPORT</span>
        </h1>

        {/* Type selection */}
        {!type && (
          <div>
            <p className="text-sm text-gray-400 max-w-lg leading-relaxed mb-8">
              Use this form to submit a conduct concern or recognize outstanding sportsmanship. All submissions are reviewed by CMBA staff. Concerns related to officials are forwarded to Basketball Alberta's SCC when appropriate.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
              <button onClick={() => { setType('concern'); setStep(1) }}
                className="border border-red-600/30 bg-red-600/5 p-7 text-left hover:bg-red-600/10 transition-colors group">
                <AlertTriangle size={28} className="text-red-500 mb-4"/>
                <h2 className="font-display text-2xl tracking-wide text-white mb-2">Submit a Concern</h2>
                <p className="text-sm text-gray-300 leading-relaxed">Report conduct, officiating, or safety issues that need CMBA's attention.</p>
                <div className="mt-4 font-mono text-[10px] tracking-[2px] uppercase text-red-500 group-hover:tracking-[2px] transition-all">Continue →</div>
              </button>
              <button onClick={() => { setType('compliment'); setStep(1) }}
                className="border border-white/8 bg-white/2 p-7 text-left hover:bg-white/5 transition-colors group">
                <Star size={28} className="text-yellow-400 mb-4"/>
                <h2 className="font-display text-2xl tracking-wide text-white mb-2">Submit a Compliment</h2>
                <p className="text-sm text-gray-300 leading-relaxed">Recognize an official, coach, or player who demonstrated exceptional sportsmanship.</p>
                <div className="mt-4 font-mono text-[10px] tracking-[2px] uppercase text-yellow-500 group-hover:tracking-[2px] transition-all">Continue →</div>
              </button>
            </div>
          </div>
        )}

        {type && (
          <div className="max-w-2xl">
            {/* Back + type indicator */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setType(null)} className="font-mono text-[10px] tracking-[2px] uppercase text-gray-400 hover:text-red-500">← Change</button>
              <span className={`flex items-center gap-2 font-mono text-[10px] tracking-[2px] uppercase px-3 py-1.5
                ${type==='concern' ? 'bg-red-600/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                {type==='concern' ? <AlertTriangle size={10}/> : <Star size={10}/>}
                {type==='concern' ? 'Concern Report' : 'Compliment Report'}
              </span>
            </div>

            {/* Step indicators */}
            <div className="flex gap-1 mb-8">
              {[1,2,3].map(n => (
                <div key={n} className={`h-1 flex-1 transition-all ${step>=n?'bg-red-600':'bg-white/10'}`}/>
              ))}
            </div>

            {/* STEP 1: Your Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl tracking-wide text-white mb-1">Your Information</h2>
                <p className="text-sm text-gray-400 mb-6">Your contact information is kept confidential and used only by CMBA staff for follow-up.</p>
                {[
                  { label:'Full Name *', key:'submitter_name', type:'text', ph:'Jane Smith' },
                  { label:'Email *', key:'submitter_email', type:'email', ph:'you@example.com' },
                  { label:'Phone (optional)', key:'submitter_phone', type:'tel', ph:'+1 (403) 555-0100' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e=>set(f.key, e.target.value)}
                      placeholder={f.ph}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50 transition-colors"/>
                  </div>
                ))}
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Your Role</label>
                  <select value={form.submitter_role} onChange={e=>set('submitter_role', e.target.value)}
                    className="w-full bg-[#0a0400] border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50">
                    <option value="">Select your role...</option>
                    {SUBMITTER_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button onClick={()=>setStep(2)}
                  className="w-full font-display text-base tracking-[2px] bg-red-600 text-black py-4 hover:bg-red-500 transition-colors mt-4">
                  Continue → Game Details
                </button>
              </div>
            )}

            {/* STEP 2: Game Details */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl tracking-wide text-white mb-1">Game Details</h2>
                <p className="text-sm text-gray-400 mb-6">Help us identify the game in question. Fill in as much as you know.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Game Date</label>
                    <input type="date" value={form.game_date} onChange={e=>set('game_date',e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50"/>
                  </div>
                  <div>
                    <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Division</label>
                    <input value={form.division_name} onChange={e=>set('division_name',e.target.value)}
                      placeholder="e.g. Boys U13 Div 1"
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50"/>
                  </div>
                </div>
                {[
                  { label:'Home Team', key:'home_team', ph:'Team name' },
                  { label:'Away Team', key:'away_team', ph:'Team name' },
                  { label:'Venue / Gym', key:'venue_name', ph:'e.g. Glenmore Christian Academy' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.ph}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50"/>
                  </div>
                ))}

                {type === 'concern' && (
                  <div>
                    <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-3">Who is this report about? (select all that apply)</label>
                    <div className="space-y-2">
                      {REPORTED_PARTIES.map(p => (
                        <label key={p} className="flex items-center gap-3 cursor-pointer p-2.5 hover:bg-white/3 transition-colors">
                          <input type="checkbox" checked={form.reported_parties.includes(p)}
                            onChange={()=>toggleParty(p)} className="accent-red-600 w-4 h-4"/>
                          <span className="text-sm text-gray-300">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'concern' && form.reported_parties.some(p=>p.includes('Official')) && (
                  <div>
                    <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Official Concern Category</label>
                    <select value={form.official_category} onChange={e=>set('official_category',e.target.value)}
                      className="w-full bg-[#0a0400] border border-white/10 text-white px-4 py-3 text-sm outline-none">
                      <option value="">Select category...</option>
                      {OFFICIAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={()=>setStep(1)} className="flex-1 font-display text-base tracking-[2px] border border-white/15 text-gray-400 py-4 hover:text-white transition-colors">← Back</button>
                  <button onClick={()=>setStep(3)} className="flex-[2] font-display text-base tracking-[2px] bg-red-600 text-black py-4 hover:bg-red-500 transition-colors">Continue → Description</button>
                </div>
              </div>
            )}

            {/* STEP 3: Description + Submit */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-2xl tracking-wide text-white mb-1">
                  {type==='concern' ? 'Describe the Concern' : 'What Stood Out?'}
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  {type==='concern'
                    ? 'Be as specific and factual as possible. Include times, statements, and actions. Do not include personal attacks or speculation.'
                    : 'Describe what made this person or moment stand out. Be specific — what did they do, and why did it matter?'}
                </p>
                <div>
                  <label className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 block mb-2">Description *</label>
                  <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={7}
                    placeholder={type==='concern'
                      ? 'Describe the incident as clearly and factually as possible...'
                      : 'Describe what made this person or moment worth recognizing...'}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-red-600/50 resize-none leading-relaxed"/>
                </div>

                {type === 'concern' && (
                  <div className="border border-yellow-500/20 bg-yellow-500/4 p-4">
                    <div className="flex gap-2 items-start">
                      <AlertTriangle size={13} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Concerns involving officials are reviewed by CMBA and may be forwarded to Basketball Alberta's Supervisor of Competition Conduct (SCC). CMBA does not override officiating decisions, but patterns of misconduct are addressed through formal channels.
                      </p>
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.acknowledged_policy}
                    onChange={e=>set('acknowledged_policy',e.target.checked)}
                    className="accent-red-600 w-4 h-4 mt-0.5 flex-shrink-0"/>
                  <span className="text-xs text-gray-300 leading-relaxed">
                    I confirm that this submission is truthful and made in good faith. I understand that false or malicious reports may result in consequences under CMBA's conduct policy. I acknowledge that CMBA staff will contact me at the email provided.
                  </span>
                </label>

                {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

                <div className="flex gap-3">
                  <button onClick={()=>setStep(2)} className="flex-1 font-display text-base tracking-[2px] border border-white/15 text-gray-400 py-4 hover:text-white transition-colors">← Back</button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex-[2] font-display text-base tracking-[2px] bg-red-600 text-black py-4 hover:bg-red-500 transition-colors disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Report →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
