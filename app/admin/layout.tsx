import { AdminSidebar } from '@/components/nav/AdminSidebar'
import { CourtBackground } from '@/components/ui/CourtBackground'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <CourtBackground />
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  )
}