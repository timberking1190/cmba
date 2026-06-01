import { fmtTime, getStatusColor } from '@/lib/utils'
import { MapPin, Clock } from 'lucide-react'

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
  const time = new Date(game.scheduled_at).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
  const hasScore = game.home_score !== null && game.home_score !== undefined
  const statusColor = getStatusColor(game.status)

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-white/4 hover:bg-white/3 transition-colors group">
      <div className="font-mono text-xs text-red-400 min-w-[60px]">{time}</div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-lg tracking-wide text-white leading-none mb-1">
          {game.home_team_name}
          <span className="text-gray-600 mx-2">vs</span>
          {game.away_team_name}
          {game.category && (
            <span className="ml-2 font-mono text-[8px] tracking-[1px] bg-white/5 text-gray-600 px-1.5 py-0.5 align-middle">
              {game.category}
            </span>
          )}
        </div>
        {game.venue && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin size={10} />
            <span>{game.venue.name}</span>
            {game.venue.google_maps_url && (
              <a href={game.venue.google_maps_url} target="_blank"
                className="ml-1 text-red-600/70 hover:text-red-400 font-mono text-[9px] tracking-[1px]">
                Directions ↗
              </a>
            )}
          </div>
        )}
        {!game.venue && game.court && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <MapPin size={10} />
            {game.court}
          </div>
        )}
      </div>
      {hasScore && game.status === 'final' ? (
        <div className="flex items-center gap-2">
          <div className="font-display text-2xl text-red-400 bg-red-600/10 px-3 py-1 min-w-[44px] text-center">{game.home_score}</div>
          <span className="text-gray-700 text-sm">—</span>
          <div className="font-display text-2xl text-gray-300 bg-white/5 px-3 py-1 min-w-[44px] text-center">{game.away_score}</div>
        </div>
      ) : null}
      <span className={`font-mono text-[9px] tracking-[1px] uppercase px-2.5 py-1 ${statusColor}
        ${game.status === 'live' ? 'animate-live' : ''}`}>
        {game.status === 'live' ? '● Live' : game.status}
      </span>
    </div>
  )
}