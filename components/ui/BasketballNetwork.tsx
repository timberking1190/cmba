const NODES = [
  { label: 'COACH',     icon: '🏀', angle: 0   },
  { label: 'ATHLETE',   icon: '👟', angle: 60  },
  { label: 'PARENT',    icon: '👥', angle: 120 },
  { label: 'OFFICIAL',  icon: '🏁', angle: 180 },
  { label: 'CLUB',      icon: '🏠', angle: 240 },
  { label: 'COMMUNITY', icon: '⭐', angle: 300 },
]

const cx = 260, cy = 260
const BALL_R = 118
const ORBIT_R = 208
const NODE_R  = 36   // bigger circles = more room for text

function pt(deg: number, r: number) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

export function BasketballNetwork() {
  return (
    /* ── WRAPPER ───────────────────────────────────────────────────────
       top: 45%, translateY(-70%) ➜ visual ball-center lands at ~30% of
       viewport height — well above the fold centre, aligned with "Minor"
    ─────────────────────────────────────────────────────────────────── */
    <div
      className="absolute pointer-events-none"
      style={{
        right: '-1%',
        top: '45%',
        transform: 'translateY(-70%)',
        width: 'clamp(340px, 40vw, 540px)',
        aspectRatio: '1',
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
          <radialGradient id="bShine" cx="30%" cy="25%" r="42%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <clipPath id="bClip"><circle cx={cx} cy={cy} r={BALL_R} /></clipPath>

          <filter id="ballGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="labelGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          <style>{`
            @keyframes netSpin       { to { transform: rotate(360deg); } }
            @keyframes counterSpin   { to { transform: rotate(-360deg); } }
            @keyframes hexPulse      { 0%,100%{opacity:.12}50%{opacity:.45} }
            @keyframes spokePulse    { 0%,100%{opacity:.28}50%{opacity:.72} }
            @keyframes dotPulse      { 0%,100%{opacity:.6}50%{opacity:1} }
            @keyframes auraBreath    { 0%,100%{r:130;opacity:.08}50%{r:145;opacity:.16} }

            @media (prefers-reduced-motion: reduce) {
              #netGroup, .nodeLabelG { animation: none !important; }
            }

            #netGroup {
              transform-origin: ${cx}px ${cy}px;
              animation: netSpin 40s linear infinite;
            }
            .nodeLabelG {
              animation: counterSpin 40s linear infinite;
            }
            .hexLine  { animation: hexPulse   4s ease-in-out infinite; }
            .spokeLine { animation: spokePulse 3s ease-in-out infinite; }
            .dotOrb   { animation: dotPulse   2.5s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Breathing aura */}
        <circle cx={cx} cy={cy} r={130} fill="rgba(160,0,0,0.1)" filter="url(#ballGlow)">
          <animate attributeName="r"    values="128;148;128" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".08;.18;.08" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* ── ROTATING NETWORK ── */}
        <g id="netGroup">

          {/* Hex outline */}
          {NODES.map((n, i) => {
            const a = pt(n.angle, ORBIT_R)
            const b = pt(NODES[(i+1)%6].angle, ORBIT_R)
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                     stroke="rgba(204,0,0,0.2)" strokeWidth="1.2" className="hexLine" />
          })}

          {/* Spokes */}
          {NODES.map((n, i) => {
            const from = pt(n.angle, BALL_R + 8)
            const to   = pt(n.angle, ORBIT_R - NODE_R - 5)
            return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                     stroke="rgba(204,0,0,0.5)" strokeWidth="1.5" className="spokeLine" />
          })}

          {/* Nodes */}
          {NODES.map((n, i) => {
            const p = pt(n.angle, ORBIT_R)
            return (
              <g key={i} transform={`translate(${p.x},${p.y})`}>
                {/* Outer ring glow */}
                <circle r={NODE_R + 3} fill="none"
                  stroke="rgba(204,0,0,0.25)" strokeWidth="1" />
                {/* Main circle */}
                <circle r={NODE_R}
                  fill="rgba(5,1,0,0.95)"
                  stroke="rgba(204,0,0,0.85)" strokeWidth="1.8" />
                {/* Subtle red fill */}
                <circle r={NODE_R} fill="rgba(204,0,0,0.07)" />

                {/* Counter-rotating label group — stays upright */}
                <g className="nodeLabelG"
                  style={{ transformOrigin: '0px 0px' }}>

                  {/* Dark pill bg — ensures readability on any bg */}
                  <rect
                    x={-(NODE_R - 3)} y={-15}
                    width={(NODE_R - 3) * 2} height="30"
                    rx="5"
                    fill="rgba(0,0,0,0.65)"
                  />

                  {/* Label text — 14px Bebas Neue, bright white */}
                  <text
                    y="-3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="'Bebas Neue', sans-serif"
                    fontSize="14"
                    letterSpacing="1.8"
                    fontWeight="400"
                  >
                    {n.label}
                  </text>

                  {/* Icon */}
                  <text y="12" textAnchor="middle" fontSize="13">
                    {n.icon}
                  </text>
                </g>
              </g>
            )
          })}
        </g>

        {/* Surface dots where spokes meet ball */}
        {NODES.map((n, i) => {
          const p = pt(n.angle, BALL_R + 1)
          return (
            <circle key={i} cx={p.x} cy={p.y} r={4}
              fill="rgba(255,210,190,0.8)"
              filter="url(#dotGlow)"
              className="dotOrb" />
          )
        })}

        {/* ── BASKETBALL ── */}
        <circle cx={cx} cy={cy} r={BALL_R}
          fill="url(#bGrad)" filter="url(#ballGlow)" />

        {/* Seams */}
        <g clipPath="url(#bClip)"
           fill="none" stroke="rgba(0,0,0,0.45)"
           strokeWidth="3.5" strokeLinecap="round">
          <line x1={cx - BALL_R + 8} y1={cy} x2={cx + BALL_R - 8} y2={cy} />
          <line x1={cx} y1={cy - BALL_R + 8} x2={cx} y2={cy + BALL_R - 8} />
          <path d={`M${cx},${cy-BALL_R+8} Q${cx-76},${cy-28} ${cx-76},${cy} Q${cx-76},${cy+28} ${cx},${cy+BALL_R-8}`} />
          <path d={`M${cx},${cy-BALL_R+8} Q${cx+76},${cy-28} ${cx+76},${cy} Q${cx+76},${cy+28} ${cx},${cy+BALL_R-8}`} />
        </g>

        {/* Shine overlay */}
        <circle cx={cx} cy={cy} r={BALL_R} fill="url(#bShine)" />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={5}
          fill="rgba(255,100,80,0.6)" filter="url(#dotGlow)" />
      </svg>
    </div>
  )
}
