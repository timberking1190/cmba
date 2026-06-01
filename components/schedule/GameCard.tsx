import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'

interface Game {
  id: string
  home_team_name: string
  away_team_name: string
  scheduled_at: string
  home_score?: number | null
  away_score?: number | null
  status: string
  category?: string
  court?: string
  venue?: { name: string; google_maps_url?: string; address?: string }
}

export function GameCard({ game }: { game: Game }) {
  const dt   = new Date(game.scheduled_at)
  const time = dt.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
  const hasScore = game.home_score !== null && game.home_score !== undefined
  const statusColor = getStatusColor(game.status)
  const isLive = game.status === 'live'

  const mapsHref = game.venue?.google_maps_url
    || `https://maps.google.com/?q=${encodeURIComponent(game.venue?.name || game.court || '')}`

  return (
    /* Mobile: stacked layout. Desktop: horizontal */
    <div className="border-b border-white/4 last:border-0 hover:bg-white/3 active:bg-white/5 transition-colors">
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 px-4 md:px-5 py-4">
        {/* Time + Status row on mobile */}
        <div className="flex items-center justify-between xs:block xs:min-w-[64px]">
          <div className="font-mono text-xs text-red-400">{time}</div>
          <span className={`xs:hidden font-mono text-[11px] tracking-[1px] uppercase px-2 py-1 ${statusColor} ${isLive ? 'animate-live' : ''}`}>
            {isLive ? '● Live' : game.status}
          </span>
        </div>

        {/* Teams + venue */}
        <div className="flex-1 min-w-0">
          <div className="font-display text-base xs:text-lg tracking-wide text-white leading-tight mb-1">
            {game.home_team_name}
            <span className="text-gray-400 mx-1.5 xs:mx-2">vs</span>
            {game.away_team_name}
            {game.category && (
              <span className="ml-2 font-mono text-[10px] tracking-[1px] bg-white/5 text-gray-400 px-1.5 py-0.5 align-middle hidden xs:inline">
                {game.category}
              </span>
            )}
          </div>
          {(game.venue || game.court) && (
            /* "Get Directions" — proper touch target via padding */
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 active:text-red-300 transition-colors py-1 -my-1"
              aria-label={`Get directions to ${game.venue?.name || game.court}`}
            >
              <MapPin size={10} />
              <span>{game.venue?.name || game.court}</span>
              <span className="text-red-600/70 font-mono text-[11px] tracking-[1px] ml-1">↗</span>
            </a>
          )}
        </div>

        {/* Score or status — desktop */}
        <div className="flex items-center gap-2 xs:gap-3 self-end xs:self-auto">
          {hasScore && game.status === 'final' && (
            <div className="flex items-center gap-1">
              <div className="font-display text-xl xs:text-2xl text-red-400 bg-red-600/10 px-2.5 xs:px-3 py-1 min-w-[36px] xs:min-w-[44px] text-center">
                {game.home_score}
              </div>
              <span className="text-gray-400 text-sm">—</span>
              <div className="font-display text-xl xs:text-2xl text-gray-300 bg-white/5 px-2.5 xs:px-3 py-1 min-w-[36px] xs:min-w-[44px] text-center">
                {game.away_score}
              </div>
            </div>
          )}
          <span className={`hidden xs:block font-mono text-[11px] tracking-[1px] uppercase px-2.5 py-1.5 ${statusColor} ${isLive ? 'animate-live' : ''}`}>
            {isLive ? '● Live' : game.status}
          </span>
        </div>
      </div>
    </div>
  )
}
