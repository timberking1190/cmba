interface Standing {
  id: string
  team_name: string
  club_short_name?: string
  team_color?: string
  wins: number
  losses: number
  ties: number
  points: number
  points_for: number
  points_against: number
  point_diff: number
  games_played: number
  form?: string[]
}

export function StandingsTable({ standings, title }: { standings: Standing[]; title: string }) {
  const sorted = [...standings].sort((a,b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.point_diff !== a.point_diff) return b.point_diff - a.point_diff
    return b.points_for - a.points_for
  })

  return (
    <div className="border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-red-600/4 border-b border-white/8">
        <span className="font-display text-base tracking-[2px] text-white">{title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8 bg-black/20">
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-4 py-2.5 text-left w-8">#</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-4 py-2.5 text-left">Team</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">GP</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">W</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">L</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">T</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center text-red-600">PTS</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">PF</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">PA</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-3 py-2.5 text-center">DIFF</th>
              <th className="font-mono text-[9px] tracking-[2px] uppercase text-gray-600 px-4 py-2.5 text-right">Last 5</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                <td className="font-mono text-xs text-red-500 px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                         style={{ background: s.team_color || '#CC0000' }} />
                    <span className="font-medium text-white text-sm">{s.team_name}</span>
                  </div>
                </td>
                <td className="font-mono text-xs text-gray-400 px-3 py-3 text-center">{s.games_played}</td>
                <td className="font-mono text-xs text-gray-400 px-3 py-3 text-center">{s.wins}</td>
                <td className="font-mono text-xs text-gray-400 px-3 py-3 text-center">{s.losses}</td>
                <td className="font-mono text-xs text-gray-400 px-3 py-3 text-center">{s.ties}</td>
                <td className="font-mono text-sm font-bold text-red-500 px-3 py-3 text-center">{s.points}</td>
                <td className="font-mono text-xs text-gray-400 px-3 py-3 text-center">{s.points_for}</td>
                <td className="font-mono text-xs text-gray-400 px-3 py-3 text-center">{s.points_against}</td>
                <td className={`font-mono text-xs px-3 py-3 text-center ${s.point_diff > 0 ? 'text-green-400' : s.point_diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {s.point_diff > 0 ? '+' : ''}{s.point_diff}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    {(s.form || []).slice(0,5).map((r,j) => (
                      <span key={j} className={`w-4 h-4 font-mono text-[8px] flex items-center justify-center
                        ${r==='W' ? 'bg-green-500/20 text-green-400' : r==='L' ? 'bg-red-600/20 text-red-400' : 'bg-white/8 text-gray-500'}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}