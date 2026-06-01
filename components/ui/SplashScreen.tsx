"use client"
import { useState, useEffect, useCallback } from 'react'

/* ─── timing constants (ms) ──────────────────────────── */
const T = {
  glow:    150,
  ball:    300,
  court:   700,
  logo:   1100,
  line1:  1350,
  line2:  1550,
  line3:  1750,
  tag:    2050,
  hint:   2500,
  auto:   3800,   // auto-dismiss after this
  exit:    680,   // curtain animation duration
}

export function SplashScreen() {
  const [phase, setPhase]   = useState<'hidden'|'in'|'hold'|'exit'>('hidden')
  const [tick, setTick]     = useState(0)

  const dismiss = useCallback(() => {
    if (phase === 'exit' || phase === 'hidden') return
    setPhase('exit')
    setTimeout(() => {
      setPhase('hidden')
      try { sessionStorage.setItem('cmba_splash', '1') } catch {}
    }, T.exit + 80)
  }, [phase])

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('cmba_splash')
      const mobile = window.innerWidth < 900
      if (seen || !mobile) return
    } catch {}

    setPhase('in')

    // Staggered phase ticks for CSS animation triggers
    const intervals = Object.values(T).filter(v => v < T.auto).map(
      delay => setTimeout(() => setTick(t => t + 1), delay)
    )
    const auto = setTimeout(dismiss, T.auto)
    return () => { intervals.forEach(clearTimeout); clearTimeout(auto) }
  }, [])

  if (phase === 'hidden') return null

  const elapsed = (delay: number) => tick > 0 && phase !== 'hidden'
  const show = (delay: keyof typeof T) => tick >= Object.keys(T).indexOf(delay)

  const isExiting = phase === 'exit'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CMBA — Welcome"
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#030100',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        animation: isExiting ? `contentFade ${T.exit}ms cubic-bezier(0.4,0,0.2,1) forwards` : 'none',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Red exit curtain */}
      {isExiting && (
        <div style={{
          position: 'absolute', inset: 0, background: '#CC0000', zIndex: 10,
          animation: `curtainUp ${T.exit}ms cubic-bezier(0.76,0,0.24,1) forwards`,
          pointerEvents: 'none',
        }} aria-hidden="true" />
      )}

      {/* ── COURT BACKGROUND SVG ────────────────────── */}
      <svg
        viewBox="0 0 360 640"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: phase === 'in' ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        <g fill="none" stroke="rgba(204,0,0,0.22)" strokeWidth="1.5"
           style={{
             strokeDasharray: 900,
             strokeDashoffset: 900,
             animation: tick >= 2 ? `courtDraw 1.2s ease-out forwards` : 'none',
           }}>
          {/* Centre circle */}
          <circle cx="180" cy="320" r="72" />
          {/* Centre dot */}
          <circle cx="180" cy="320" r="5" fill="rgba(204,0,0,0.3)" stroke="none"/>
          {/* Half-court line */}
          <line x1="24" y1="320" x2="336" y2="320" />
          {/* Outer boundary */}
          <rect x="24" y="80" width="312" height="480" rx="4" />
          {/* Paint (key) top */}
          <rect x="96" y="80" width="168" height="148" />
          <line x1="96" y1="188" x2="264" y2="188" />
          {/* Free throw arc */}
          <path d="M 96,188 A 84,84 0 0,0 264,188" />
          {/* Paint bottom */}
          <rect x="96" y="412" width="168" height="148" />
          <line x1="96" y1="452" x2="264" y2="452" />
          <path d="M 96,452 A 84,84 0 0,1 264,452" />
          {/* 3pt arcs */}
          <path d="M 36,80 L 36,224 A 152,152 0 0,0 324,224 L 324,80" />
          <path d="M 36,560 L 36,416 A 152,152 0 0,1 324,416 L 324,560" />
        </g>

        {/* Radial glow */}
        <radialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(180,0,0,0.25)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
        <rect width="360" height="640" fill="url(#splashGlow)"
          style={{ animation: tick >= 1 ? 'glowPulse 2.4s ease-in-out infinite' : 'none' }}/>
      </svg>

      {/* ── BALL + SQUISH WRAPPER ────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
        marginTop: '-80px',
      }} aria-hidden="true">

        {/* Ping ring */}
        {tick >= 2 && (
          <div style={{
            position: 'absolute', inset: '-32px',
            borderRadius: '50%',
            border: '2px solid rgba(204,0,0,0.5)',
            animation: `pingRed 0.9s ease-out forwards`,
          }} />
        )}

        {/* Ball */}
        <div style={{
          width: 108, height: 108,
          animation: tick >= 1
            ? `ballDrop 1.35s cubic-bezier(0.22,1,0.36,1) forwards`
            : 'none',
          opacity: tick >= 1 ? 1 : 0,
        }}>
          {/* Squish layer */}
          <div style={{
            width: '100%', height: '100%',
            animation: tick >= 1 ? `ballSquish 1.35s ease-out forwards` : 'none',
            transformOrigin: 'bottom center',
          }}>
            <svg viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 28px rgba(200,0,0,0.7))' }}>
              <defs>
                <radialGradient id="bg" cx="38%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#EE2222"/>
                  <stop offset="55%" stopColor="#CC0000"/>
                  <stop offset="100%" stopColor="#6B0000"/>
                </radialGradient>
                <radialGradient id="shine" cx="28%" cy="22%" r="45%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.3)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
                <clipPath id="bc"><circle cx="54" cy="54" r="52"/></clipPath>
              </defs>
              <circle cx="54" cy="54" r="52" fill="url(#bg)"/>
              <g clipPath="url(#bc)" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="3.2" strokeLinecap="round">
                <line x1="4" y1="54" x2="104" y2="54"/>
                <line x1="54" y1="4" x2="54" y2="104"/>
                <path d="M54,4 Q22,24 22,54 Q22,84 54,104"/>
                <path d="M54,4 Q86,24 86,54 Q86,84 54,104"/>
              </g>
              <circle cx="54" cy="54" r="52" fill="url(#shine)"/>
            </svg>
          </div>
        </div>

        {/* Shadow */}
        <div style={{
          width: 72, height: 10, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          margin: '4px auto 0',
          filter: 'blur(4px)',
          animation: tick >= 1
            ? `ballDrop 1.35s cubic-bezier(0.22,1,0.36,1) forwards`
            : 'none',
          opacity: tick >= 1 ? 0.5 : 0,
          transform: 'scaleY(0.4)',
        }} />
      </div>

      {/* ── WORDMARK BLOCK ──────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: '30px',
        textAlign: 'center',
      }} aria-live="polite">

        {/* Logo mark */}
        {tick >= 3 && (
          <img src="/logo.png" alt="CMBA"
            style={{
              height: 40, width: 'auto', marginBottom: 24,
              animation: `splashLogoIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards`,
            }}/>
        )}

        {/* CALGARY */}
        <div aria-hidden="true" style={{ overflow: 'hidden', marginBottom: 2 }}>
          {tick >= 4 && (
            <div style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(56px, 16vw, 72px)',
              color: '#F1F5F9',
              lineHeight: 0.9,
              letterSpacing: '0.04em',
              animation: `splashLineIn 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards`,
            }}>CALGARY</div>
          )}
        </div>

        {/* MINOR */}
        <div aria-hidden="true" style={{ overflow: 'hidden', marginBottom: 2 }}>
          {tick >= 5 && (
            <div style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(56px, 16vw, 72px)',
              color: '#F1F5F9',
              lineHeight: 0.9,
              letterSpacing: '0.04em',
              animation: `splashLineIn 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards`,
            }}>MINOR</div>
          )}
        </div>

        {/* BASKETBALL */}
        <div aria-hidden="true" style={{ overflow: 'hidden', marginBottom: 20 }}>
          {tick >= 6 && (
            <div style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(56px, 16vw, 72px)',
              color: '#CC0000',
              lineHeight: 0.9,
              letterSpacing: '0.04em',
              filter: 'drop-shadow(0 0 20px rgba(204,0,0,0.6))',
              animation: `splashLineIn 0.5s cubic-bezier(0.34,1.2,0.64,1) forwards`,
            }}>BASKETBALL</div>
          )}
        </div>

        {/* Tagline */}
        {tick >= 7 && (
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            color: '#94A3B8',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            animation: `splashTagIn 0.7s ease forwards`,
          }}>
            Calgary Minor Basketball Association
          </div>
        )}
      </div>

      {/* ── TAP HINT ────────────────────────────────── */}
      {tick >= 8 && !isExiting && (
        <div aria-label="Tap to enter"
          style={{
            position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 36px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            animation: `splashHintPulse 1.6s ease-in-out infinite`,
          }}>
          <div style={{
            width: 28, height: 28,
            border: '1.5px solid rgba(204,0,0,0.5)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid rgba(204,0,0,0.7)',
              marginTop: 2,
            }}/>
          </div>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: '0.2em',
            color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase',
          }}>
            Tap to enter
          </span>
        </div>
      )}
    </div>
  )
}
