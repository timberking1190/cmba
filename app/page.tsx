import Link from 'next/link'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'
import { BasketballNetwork } from '@/components/ui/BasketballNetwork'

export default function HomePage() {
  const modules = [
    { href: '/schedule',  icon: '📅', num: '01', title: 'Schedule & Standings', desc: 'Game times, live scores, standings, and directions. No login required.' },
    { href: '/rules',     icon: '📖', num: '02', title: 'Rules Hub',            desc: 'Complete rulebook, AI search, division modifications at a glance.' },
    { href: '/education/coach', icon: '🏀', num: '03', title: 'Coach Education',      desc: 'NCCP pathways, course modules, clinic registration.' },
    { href: '/education/officials', icon: '🏁', num: '04', title: 'Referee Education',    desc: 'Signals guide, RAMP pathway, Points of Emphasis.' },
    { href: '/report',    icon: '📋', num: '05', title: 'Game Report',          desc: 'Concerns and compliments. Structured, accountable, followed up.' },
  ]

  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-5 md:px-14 pt-24 pb-32 md:pb-20 overflow-hidden">

        {/* Basketball network — hidden on small phones, shown md+ */}
        <div className="hidden md:block">
          <BasketballNetwork />
        </div>

        {/* Headline */}
        <h1
          className="font-display leading-[0.88] tracking-[-2px] mb-8 animate-fade-up"
          style={{ fontSize: 'clamp(72px, 12vw, 180px)' }}
        >
          <span className="block text-white">Calgary</span>
          <span className="block text-white">Minor</span>
          <span
            className="block"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px #CC0000',
              filter: 'drop-shadow(0 0 30px rgba(204,0,0,0.5))',
            }}
          >
            Basketball
          </span>
        </h1>

        <p className="text-slate-200 text-base md:text-lg font-light max-w-md mb-10 leading-relaxed">
          Every game. Every rule. Every coach, referee, and parent.
          Built for the bench and the bleachers.
        </p>

        <div className="flex flex-col xs:flex-row gap-3 md:gap-4">
          <Link
            href="/schedule"
            className="font-display text-lg tracking-[2px] bg-red-600 text-black px-8 py-4 hover:bg-red-500 transition-colors text-center"
          >
            Find Tonight's Games
          </Link>
          <Link
            href="/signup"
            className="font-display text-lg tracking-[2px] border border-white/15 text-white px-8 py-4 hover:border-white/30 transition-colors text-center"
          >
            Create Account
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:flex gap-px md:gap-0 mt-12 md:mt-16 border border-white/8">
          {[
            { val: '400+',   lbl: 'Teams' },
            { val: '2,000+', lbl: 'Games / Season' },
            { val: '15+',    lbl: 'Divisions' },
            { val: '12',     lbl: 'Venues' },
          ].map(s => (
            <div key={s.lbl} className="px-6 md:px-8 py-5 border-r border-white/8 last:border-r-0 bg-white/2">
              <div className="font-display text-2xl md:text-3xl text-red-500">{s.val}</div>
              <div className="font-mono text-[11px] tracking-[2px] uppercase text-gray-400 mt-1">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM MODULES ────────────────────────────── */}
      <section className="relative z-10 px-5 md:px-14 py-12 md:py-20">
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <div className="w-7 h-px bg-red-600" />
          <span className="font-mono text-[10px] tracking-[2px] uppercase text-red-500">The Platform</span>
        </div>
        <h2
          className="font-display leading-none tracking-[-1px] text-white mb-4"
          style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
        >
          EVERYTHING YOUR<br />
          <span className="text-red-500">LEAGUE NEEDS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/8 border border-white/8 mt-10 md:mt-12">
          {modules.map(m => (
            <Link
              key={m.href}
              href={m.href}
              className="bg-[#060200] p-6 md:p-7 group hover:bg-[#0d0400] active:bg-[#0d0400] transition-colors relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <span className="font-mono text-[10px] text-gray-400 tracking-[2px] mb-4 block">{m.num} / 05</span>
              <span className="text-2xl mb-3 block">{m.icon}</span>
              <div className="font-display text-xl tracking-wide text-white mb-2">{m.title}</div>
              <div className="text-xs text-gray-300 leading-relaxed">{m.desc}</div>
              <div className="absolute top-5 right-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm">↗</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 px-5 md:px-14 py-6 md:py-8 flex items-center justify-between flex-wrap gap-4">
        <img src="/logo.png" alt="CMBA" className="h-8 w-auto" />
        <ul className="hidden md:flex gap-6 list-none">
          {['Schedule','Standings','Rules','Education','Report'].map(l => (
            <li key={l}>
              <Link href={`/${l.toLowerCase()}`}
                className="font-mono text-[10px] tracking-[2px] uppercase text-gray-400 hover:text-white transition-colors">
                {l}
              </Link>
            </li>
          ))}
        </ul>
        <div className="font-mono text-[10px] text-gray-400">© 2025–26 CMBA · Boost Innovation</div>
      </footer>
    </div>
  )
}
