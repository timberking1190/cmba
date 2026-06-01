import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDate(d: string): string {
  if (!d) return '—'
  const parts = d.split('/')
  if (parts.length === 3) {
    const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(parts[0])]} ${parseInt(parts[1])}, ${parts[2]}`
  }
  try {
    return new Date(d).toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric' })
  } catch { return d }
}

export function fmtTime(t: string): string {
  if (!t) return '—'
  const parts = t.split(':')
  if (parts.length >= 2) {
    let h = parseInt(parts[0]), m = parts[1], ap = 'AM'
    if (h >= 12) { ap = 'PM'; if (h > 12) h -= 12 }
    if (h === 0) h = 12
    return `${h}:${m} ${ap}`
  }
  return t
}

export function getStatusColor(status: string) {
  const map: Record<string,string> = {
    scheduled: 'bg-white/5 text-gray-400',
    warmup: 'bg-yellow-500/10 text-yellow-400',
    live: 'bg-red-600/20 text-red-400',
    halftime: 'bg-orange-500/10 text-orange-400',
    final: 'bg-green-500/10 text-green-400',
    postponed: 'bg-yellow-500/10 text-yellow-400',
    cancelled: 'bg-red-900/20 text-red-700',
    forfeit: 'bg-red-900/20 text-red-700',
  }
  return map[status] || 'bg-white/5 text-gray-400'
}

export type UserRole = 'admin'|'commissioner'|'coach'|'referee'|'scorekeeper'|'parent'|'player'|'volunteer'
export const ROLES: {value: UserRole, label: string}[] = [
  {value:'admin', label:'Administrator'},
  {value:'commissioner', label:'Commissioner'},
  {value:'coach', label:'Coach'},
  {value:'referee', label:'Referee'},
  {value:'scorekeeper', label:'Scorekeeper'},
  {value:'parent', label:'Parent/Guardian'},
  {value:'player', label:'Player'},
  {value:'volunteer', label:'Volunteer'},
]
