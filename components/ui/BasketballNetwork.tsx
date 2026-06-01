const NODES = [
  { label: 'COACH',     icon: '🏀', angle: 300 },
  { label: 'ATHLETE',   icon: '👟', angle: 0   },
  { label: 'PARENT',    icon: '👥', angle: 60  },
  { label: 'OFFICIAL',  icon: '🏁', angle: 120 },
  { label: 'CLUB',      icon: '🏠', angle: 180 },
  { label: 'COMMUNITY', icon: '⭐', angle: 240 },
]

const cx = 260, cy = 260
const BALL_R = 115
const ORBIT_R = 200
const NODE_R  = 34

function pt(deg: number, r: number) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

export function BasketballNetwork() {
  return (
    <div
      className="absolute pointer-events-none hidden md:block"
      style={{
        /* Centre the ball in the right 40% of the viewport */
        right: '3%',
        top: '50%',
        transform: 'translateY(-58%)',
        width: 'clamp(320px, 36vw, 500px)',
        aspectRatio: '1 / 1',
        zIndex: 2,
      }}
    >
      <svg
        viewBox="0 0 520 520"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="bGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#EE2222" />
            <stop offset="55%"  stopColor="#CC0000" />
            <stop offset="100%" stopColor="#7A0000" />
          </radialGradient>
          <radialGradient id="bShine" cx="28%" cy="22%" r="45%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <clipPath id="bClip"><circle cx={cx} cy={cy} r={BALL_R} /></clipPath>

          <filter id="ballGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="12" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <style>{`
            @keyframes netSpin     { to { transform: rotate(360deg); } }
            @keyframes counterSpin { to { transform: rotate(-360deg); } }
            @keyframes hexPulse    { 0%,100%{opacity:.1}50%{opacity:.4} }
            @keyframes spokePulse  { 0%,100%{opacity:.25}50%{opacity:.7} }
            @keyframes dotPulse    { 0%,100%{opacity:.55}50%{opacity:1} }
            @media (prefers-reduced-motion: reduce) {
              #netGroup, .nodeLabelG { animation: none !important; }
            }
            #netGroup {
              transform-origin: ${cx}px ${cy}px;
              animation: netSpin 42s linear infinite;
            }
            .nodeLabelG { animation: counterSpin 42s linear infinite; }
            .hexLine    { animation: hexPulse   4s ease-in-out infinite; }
            .spokeLine  { animation: spokePulse 3s ease-in-out infinite; }
            .dotOrb     { animation: dotPulse 2.5s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Ambient aura */}
        <circle cx={cx} cy={cy} r={BALL_R + 18} fill="rgba(150,0,0,0.09)" filter="url(#ballGlow)">
          <animate attributeName="r" values={`${BALL_R+14};${BALL_R+26};${BALL_R+14}`} dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".07;.16;.07" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Rotating network */}
        <g id="netGroup">
          {/* Hex outline */}
          {NODES.map((n, i) => {
            const a = pt(n.angle, ORBIT_R)
            const b = pt(NODES[(i+1)%6].angle, ORBIT_R)
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                     stroke="rgba(204,0,0,0.18)" strokeWidth="1.2" className="hexLine" />
          })}
          {/* Spokes */}
          {NODES.map((n, i) => {
            const from = pt(n.angle, BALL_R + 7)
            const to   = pt(n.angle, ORBIT_R - NODE_R - 4)
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                     stroke="rgba(204,0,0,0.5)" strokeWidth="1.5" className="spokeLine" />
          })}
          {/* Nodes */}
          {NODES.map((n, i) => {
            const p = pt(n.angle, ORBIT_R)
            return (
              <g key={i} transform={`translate(${p.x},${p.y})`}>
                <circle r={NODE_R + 4} fill="none" stroke="rgba(204,0,0,0.18)" strokeWidth="1" />
                <circle r={NODE_R} fill="rgba(4,1,0,0.94)" stroke="rgba(204,0,0,0.9)" strokeWidth="1.8" />
                <circle r={NODE_R} fill="rgba(204,0,0,0.06)" />
                <g className="nodeLabelG" style={{ transformOrigin: '0px 0px' }}>
                  <rect x={-NODE_R+3} y={-14} width={(NODE_R-3)*2} height="28" rx="5"
                    fill="rgba(0,0,0,0.7)" />
                  <text y="-2" textAnchor="middle"
                    fill="#FFFFFF" fontFamily="'Bebas Neue', sans-serif"
                    fontSize="13.5" letterSpacing="1.6" fontWeight="400">
                    {n.label}
                  </text>
                  <text y="13" textAnchor="middle" fontSize="12">{n.icon}</text>
                </g>
              </g>
            )
          })}
        </g>

        {/* Surface dots */}
        {NODES.map((n, i) => {
          const p = pt(n.angle, BALL_R + 1)
          return <circle key={i} cx={p.x} cy={p.y} r={3.5}
            fill="rgba(255,210,190,0.85)" filter="url(#dotGlow)" className="dotOrb" />
        })}

        {/* Ball */}
        <circle cx={cx} cy={cy} r={BALL_R} fill="url(#bGrad)" filter="url(#ballGlow)" />
        <g clipPath="url(#bClip)" fill="none" stroke="rgba(0,0,0,0.42)" strokeWidth="3.5" strokeLinecap="round">
          <line x1={cx-BALL_R+8} y1={cy} x2={cx+BALL_R-8} y2={cy} />
          <line x1={cx} y1={cy-BALL_R+8} x2={cx} y2={cy+BALL_R-8} />
          <path d={`M${cx},${cy-BALL_R+8} Q${cx-74},${cy-26} ${cx-74},${cy} Q${cx-74},${cy+26} ${cx},${cy+BALL_R-8}`} />
          <path d={`M${cx},${cy-BALL_R+8} Q${cx+74},${cy-26} ${cx+74},${cy} Q${cx+74},${cy+26} ${cx},${cy+BALL_R-8}`} />
        </g>
        <circle cx={cx} cy={cy} r={BALL_R} fill="url(#bShine)" />
        <circle cx={cx} cy={cy} r={5} fill="rgba(255,100,80,0.55)" filter="url(#dotGlow)" />
      </svg>
    </div>
  )
}
