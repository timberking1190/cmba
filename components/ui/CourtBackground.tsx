export function CourtBackground() {
  return (
    <div className="court-bg" aria-hidden="true">
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="2">
          <rect x="60" y="55" width="1320" height="700" rx="2"/>
          <line x1="720" y1="55" x2="720" y2="755"/>
          <circle cx="720" cy="405" r="92"/>
          <circle cx="720" cy="405" r="6" fill="rgba(255,255,255,0.055)" stroke="none"/>
          <path d="M 198,55 L 198,180 A 230,230 0 0,0 198,630 L 198,755"/>
          <path d="M 1242,55 L 1242,180 A 230,230 0 0,1 1242,630 L 1242,755"/>
          <rect x="60" y="285" width="198" height="240"/>
          <rect x="1182" y="285" width="198" height="240"/>
          <path d="M 258,313 A 92,92 0 0,1 258,497"/>
          <path d="M 258,313 A 92,92 0 0,0 258,497" strokeDasharray="12 10"/>
          <path d="M 1182,313 A 92,92 0 0,0 1182,497"/>
          <path d="M 1182,313 A 92,92 0 0,1 1182,497" strokeDasharray="12 10"/>
        </g>
        <defs>
          <radialGradient id="spotlight" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="rgba(140,50,0,0.18)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>
        </defs>
        <rect width="1440" height="810" fill="url(#spotlight)"/>
      </svg>
    </div>
  )
}
