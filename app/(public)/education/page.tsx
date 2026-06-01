"use client"
import Link from 'next/link'
import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'

export default function EducationPage() {
  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar active="/education" />
      <div className="relative z-10 pt-24 px-4 md:px-14 pb-32 md:pb-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-px bg-red-600"/>
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-red-500">2025–26 Season</span>
        </div>
        <h1 className="font-display text-[clamp(48px,7vw,90px)] leading-none tracking-[-1px] text-white mb-10">
          EDUCATION<br/><span className="text-red-500">HUB</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Link href="/education/coach"
            className="border border-white/8 p-8 hover:border-red-600/40 transition-colors group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"/>
            <div className="text-4xl mb-4">🏀</div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-red-500 mb-2">NCCP Recognized</div>
            <h2 className="font-display text-2xl tracking-wide text-white mb-3">Coach Education</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">NCCP pathways, certification courses, clinic registration, and professional development for CMBA coaches at every level.</p>
            <span className="font-mono text-xs text-red-500 tracking-[1px]">Explore →</span>
          </Link>
          <Link href="/education/officials"
            className="border border-white/8 p-8 hover:border-red-600/40 transition-colors group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"/>
            <div className="text-4xl mb-4">🏁</div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-red-500 mb-2">RAMP Certified</div>
            <h2 className="font-display text-2xl tracking-wide text-white mb-3">Officials Education</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">RAMP certification pathway, referee signals guide, game mechanics, and this season&apos;s points of emphasis.</p>
            <span className="font-mono text-xs text-red-500 tracking-[1px]">Explore →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
