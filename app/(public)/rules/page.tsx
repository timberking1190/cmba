import { CourtBackground } from '@/components/ui/CourtBackground'
import { Navbar } from '@/components/nav/Navbar'

export default function Page() {
  return (
    <div className="min-h-screen">
      <CourtBackground />
      <Navbar />
      <div className="relative z-10 pt-32 px-14 pb-20">
        <h1 className="font-display text-6xl text-white mb-4">Coming Soon</h1>
        <p className="text-gray-600">This page is being built out.</p>
      </div>
    </div>
  )
}