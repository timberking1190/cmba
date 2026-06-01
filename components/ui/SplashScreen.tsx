"use client"
import { useState, useEffect, useCallback } from 'react'

/*
 * All animation timing is handled by CSS animation-delay.
 * React state only tracks: hidden → showing → exiting → hidden
 * Zero tick-based re-renders = silky smooth on mobile.
 */

const AUTO_DISMISS_MS = 4000
const EXIT_MS         = 720

export function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'showing' | 'exiting'>('hidden')

  const dismiss = useCallback(() => {
    setPhase(p => {
      if (p !== 'showing') return p
      setTimeout(() => setPhase('hidden'), EXIT_MS)
      return 'exiting'
    })
  }, [])

  useEffect(() => {
    try {
      if (sessionStorage.getItem('cmba_splash')) return
      if (window.innerWidth >= 900) return
    } catch { return }

    // One rAF to ensure fonts are loaded before animating
    const raf = requestAnimationFrame(() => {
      setPhase('showing')
      const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
      return () => clearTimeout(timer)
    })
    return () => cancelAnimationFrame(raf)
  }, [dismiss])

  useEffect(() => {
    if (phase === 'hidden' && typeof sessionStorage !== 'undefined') {
      try { sessionStorage.setItem('cmba_splash', '1') } catch {}
    }
  }, [phase])

  if (phase === 'hidden') return null

  const exiting = phase === 'exiting'

  return (
    <>
      <style>{`
        /* ── GPU-accelerated layers ─────────────────────────── */
        .sp-root    { will-change: opacity, transform; }
        .sp-ball    { will-change: transform; }
        .sp-text    { will-change: transform, opacity; }
        .sp-curtain { will-change: transform; }

        /* ── Court lines draw ─────────────────────────────────
           stroke-dasharray + dashoffset set inline per path */
        @keyframes sp-court {
          to { stroke-dashoffset: 0; opacity: 1; }
        }

        /* ── Ball drops & bounces ─────────────────────────────
           translateY only (no rotation — smoother on CPU) */
        @keyframes sp-drop {
          0%   { transform: translateY(-180px); opacity: 0; }
          30%  { opacity: 1; }
          38%  { transform: translateY(0px); }
          50%  { transform: translateY(-56px); }
          62%  { transform: translateY(0px); }
          71%  { transform: translateY(-22px); }
          80%  { transform: translateY(0px); }
          87%  { transform: translateY(-8px); }
          93%  { transform: translateY(0px); }
          97%  { transform: translateY(-2px); }
          100% { transform: translateY(0px); opacity: 1; }
        }

        /* Ball shadow shrinks/grows with bounce */
        @keyframes sp-shadow {
          0%   { transform: scaleX(0.4) scaleY(0.4); opacity: 0; }
          38%,62%,80%,93%,100% { transform: scaleX(1) scaleY(1); opacity: 0.45; }
          50%,71%,87%,97% { transform: scaleX(0.55) scaleY(0.55); opacity: 0.2; }
        }

        /* Squish on impact — separate layer so it doesn't fight the drop */
        @keyframes sp-squish {
          0%,27%  { transform: scaleX(1)    scaleY(1); }
          38%,62%,80%,93% { transform: scaleX(1.18)  scaleY(0.82); }
          44%,68%,85%,96% { transform: scaleX(0.94)  scaleY(1.06); }
          100%    { transform: scaleX(1)    scaleY(1); }
        }

        /* Glow breathes */
        @keyframes sp-glow {
          0%,100% { opacity: 0.15; transform: scale(1); }
          50%     { opacity: 0.35; transform: scale(1.1); }
        }

        /* Ping ring expands once */
        @keyframes sp-ping {
          from { transform: scale(0.8); opacity: 0.9; }
          to   { transform: scale(2.8); opacity: 0; }
        }

        /* Text lines slide up */
        @keyframes sp-slideup {
          from { transform: translateY(52px); opacity: 0; }
          60%  { transform: translateY(-6px); opacity: 1; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* Logo pops in */
        @keyframes sp-pop {
          from { transform: scale(0.65); opacity: 0; }
          65%  { transform: scale(1.06); opacity: 1; }
          to   { transform: scale(1);    opacity: 1; }
        }

        /* Tagline letter-spacing unfurls */
        @keyframes sp-tag {
          from { opacity: 0; letter-spacing: 0.45em; }
          to   { opacity: 1; letter-spacing: 0.14em; }
        }

        /* Hint breathes */
        @keyframes sp-hint {
          0%,100% { opacity: 0.4; transform: translateY(0); }
          50%     { opacity: 0.85; transform: translateY(-4px); }
        }

        /* ── EXIT ──────────────────────────────────────────── */
        /* Red curtain sweeps bottom→top */
        @keyframes sp-curtain-up {
          0%   { transform: translateY(101%); }
          100% { transform: translateY(-101%); }
        }
        /* Content fades as curtain rises */
        @keyframes sp-content-out {
          0%   { opacity: 1; }
          50%  { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ── ROOT ─────────────────────────────────────────── */}
      <div
        className="sp-root"
        role="dialog"
        aria-modal="true"
        aria-label="CMBA — Calgary Minor Basketball"
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#030100',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          WebkitUserSelect: 'none', userSelect: 'none',
          animation: exiting
            ? `sp-content-out ${EXIT_MS}ms ease forwards`
            : 'none',
        }}
      >
        {/* ── RED EXIT CURTAIN ─────────────────────────────── */}
        {exiting && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              background: '#CC0000',
              animation: `sp-curtain-up ${EXIT_MS}ms cubic-bezier(0.76,0,0.24,1) forwards`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ── COURT SVG ───────────────────────────────────── */}
        <svg viewBox="0 0 360 640" aria-hidden="true"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
          <defs>
            <radialGradient id="spGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(160,0,0,0.28)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
            </radialGradient>
          </defs>

          {/* Central glow */}
          <ellipse cx="180" cy="320" rx="160" ry="160" fill="url(#spGlow)"
            style={{ animation: 'sp-glow 2.8s ease-in-out 0.6s infinite' }}/>

          {/* Court lines — each path gets its own dasharray length */}
          {[
            { d:'M24,320 L336,320',                  len: 312, delay:'0.55s' },
            { d:'M180,80  L180,560',                  len: 480, delay:'0.6s'  },
            { d:'M24,80   L336,80  L336,560 L24,560 Z', len:1040, delay:'0.65s' },
            { d:'M96,80   L96,228  L264,228 L264,80',  len: 480, delay:'0.7s'  },
            { d:'M96,412  L96,560  L264,560 L264,412', len: 480, delay:'0.72s' },
            // free throw arcs
            { d:'M96,228  A84,84 0 0,0 264,228',       len: 264, delay:'0.78s' },
            { d:'M96,412  A84,84 0 0,1 264,412',       len: 264, delay:'0.8s'  },
          ].map((p, i) => (
            <path key={i} d={p.d}
              fill="none"
              stroke="rgba(204,0,0,0.2)"
              strokeWidth="1.5"
              strokeDasharray={p.len}
              strokeDashoffset={p.len}
              style={{
                opacity: 0,
                animation: `sp-court 1s ease-out ${p.delay} forwards`,
              }}/>
          ))}

          {/* Centre circle */}
          <circle cx="180" cy="320" r="72"
            fill="none" stroke="rgba(204,0,0,0.2)" strokeWidth="1.5"
            strokeDasharray="452" strokeDashoffset="452"
            style={{ opacity:0, animation:'sp-court 1.1s ease-out 0.62s forwards' }}/>
        </svg>

        {/* ── BASKETBALL ───────────────────────────────────── */}
        <div aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: -72,
            zIndex: 3,
          }}>

          {/* Ping on first impact */}
          <div style={{
            position: 'absolute', inset: -28,
            borderRadius: '50%',
            border: '1.5px solid rgba(204,0,0,0.55)',
            animation: 'sp-ping 0.8s ease-out 0.72s forwards',
            opacity: 0,
          }}/>

          {/* Drop layer */}
          <div className="sp-ball" style={{
            width: 108, height: 108,
            animation: 'sp-drop 1.6s cubic-bezier(0.22,1,0.36,1) 0.25s forwards',
            opacity: 0,
          }}>
            {/* Squish layer — separate from drop so easing curves don't interfere */}
            <div style={{
              width: '100%', height: '100%',
              transformOrigin: 'bottom center',
              animation: 'sp-squish 1.6s ease-out 0.25s forwards',
            }}>
              <svg viewBox="0 0 108 108" style={{
                width:'100%', height:'100%',
                filter:'drop-shadow(0 0 24px rgba(200,0,0,0.65))',
              }}>
                <defs>
                  <radialGradient id="spBall" cx="36%" cy="28%" r="65%">
                    <stop offset="0%"   stopColor="#EE2222"/>
                    <stop offset="52%"  stopColor="#CC0000"/>
                    <stop offset="100%" stopColor="#6B0000"/>
                  </radialGradient>
                  <radialGradient id="spShine" cx="26%" cy="20%" r="46%">
                    <stop offset="0%"   stopColor="rgba(255,255,255,0.28)"/>
                    <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                  </radialGradient>
                  <clipPath id="spClip"><circle cx="54" cy="54" r="52"/></clipPath>
                </defs>
                <circle cx="54" cy="54" r="52" fill="url(#spBall)"/>
                <g clipPath="url(#spClip)" fill="none"
                   stroke="rgba(0,0,0,0.45)" strokeWidth="3" strokeLinecap="round">
                  <line x1="4" y1="54" x2="104" y2="54"/>
                  <line x1="54" y1="4" x2="54" y2="104"/>
                  <path d="M54,4 Q20,26 20,54 Q20,82 54,104"/>
                  <path d="M54,4 Q88,26 88,54 Q88,82 54,104"/>
                </g>
                <circle cx="54" cy="54" r="52" fill="url(#spShine)"/>
              </svg>
            </div>
          </div>

          {/* Floor shadow */}
          <div style={{
            width: 68, height: 8, margin: '3px auto 0',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            filter: 'blur(3px)',
            animation: 'sp-shadow 1.6s ease-out 0.25s forwards',
            opacity: 0,
          }}/>
        </div>

        {/* ── WORDMARK ─────────────────────────────────────── */}
        <div style={{
          position: 'relative', zIndex: 4,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: 56, textAlign: 'center',
          width: '100%',
        }}>
          {/* Logo */}
          <img src="/logo.png" alt="CMBA" className="sp-text"
            style={{
              height: 38, width: 'auto', marginBottom: 22,
              animation: 'sp-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) 1.25s forwards',
              opacity: 0,
            }}/>

          {/* CALGARY */}
          <div style={{ overflow: 'hidden', marginBottom: 0 }}>
            <div className="sp-text" style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(60px, 17vw, 76px)',
              color: '#F1F5F9', lineHeight: 0.88,
              letterSpacing: '0.04em',
              animation: 'sp-slideup 0.55s cubic-bezier(0.22,1,0.36,1) 1.48s forwards',
              opacity: 0,
            }}>CALGARY</div>
          </div>

          {/* MINOR */}
          <div style={{ overflow: 'hidden', marginBottom: 0 }}>
            <div className="sp-text" style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(60px, 17vw, 76px)',
              color: '#F1F5F9', lineHeight: 0.88,
              letterSpacing: '0.04em',
              animation: 'sp-slideup 0.55s cubic-bezier(0.22,1,0.36,1) 1.65s forwards',
              opacity: 0,
            }}>MINOR</div>
          </div>

          {/* BASKETBALL */}
          <div style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div className="sp-text" style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 'clamp(60px, 17vw, 76px)',
              color: '#CC0000', lineHeight: 0.88,
              letterSpacing: '0.04em',
              filter: 'drop-shadow(0 0 18px rgba(204,0,0,0.55))',
              animation: 'sp-slideup 0.55s cubic-bezier(0.22,1,0.36,1) 1.82s forwards',
              opacity: 0,
            }}>BASKETBALL</div>
          </div>

          {/* Tagline */}
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10.5, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: '0.45em',
            animation: 'sp-tag 0.9s ease-out 2.15s forwards',
            opacity: 0,
          }}>
            Calgary Minor Basketball
          </div>
        </div>

        {/* ── TAP HINT ─────────────────────────────────────── */}
        <div
          aria-label="Tap anywhere to enter"
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 7,
            animation: 'sp-hint 1.8s ease-in-out 2.8s infinite',
            opacity: 0,
          }}>
          {/* Downward chevron */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="rgba(204,0,0,0.5)" strokeWidth="1.2"/>
            <path d="M6.5 8.5 L10 12 L13.5 8.5" stroke="rgba(204,0,0,0.7)"
              strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9.5, letterSpacing: '0.18em',
            color: 'rgba(148,163,184,0.65)', textTransform: 'uppercase',
          }}>
            Tap to enter
          </span>
        </div>
      </div>
    </>
  )
}
