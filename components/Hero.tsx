'use client'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      paddingTop: 88, paddingBottom: '2.5rem',
      background: '#09090F',
      minHeight: 320,
    }}>
      {/* Grid lines */}
      <div className="hero-grid" />

      {/* Grain texture */}
      <div className="hero-grain" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      {/* Gold glow blob */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(160,120,32,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '0 2rem',
      }}>
        {/* Pulse dot + label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#A07820',
            display: 'inline-block',
            animation: 'pulseDot 2.5s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: '#A07820', letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            Ереван · Армения · 2026
          </span>
        </div>

        {/* Main title */}
        <h1
          className="shimmer-text"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3rem,7vw,6.5rem)',
            fontWeight: 300,
            lineHeight: 0.95,
            margin: '0 0 1.25rem 0',
            letterSpacing: '-0.01em',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
          }}
        >
          ArmNair
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-sans)', fontWeight: 300,
          fontSize: '1rem', lineHeight: 1.7,
          color: '#CCCCCC', maxWidth: 480,
          margin: '0 0 1.5rem 0',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
        }}>
          Агрегатор жилых комплексов Еревана. Мы собираем актуальные данные о рынке недвижимости Армении — цены, доходность, налоговый возврат.
        </p>

        {/* Quote box */}
        <div style={{
          borderLeft: '2px solid #A07820',
          paddingLeft: '1rem',
          maxWidth: 400,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: '0.95rem', color: '#9A9A9A', lineHeight: 1.6,
            margin: 0,
          }}>
            <span style={{ color: '#C9A96E' }}>Nair</span> — «смотри» на армянском. Мы помогаем увидеть рынок недвижимости Еревана насквозь.
          </p>
        </div>
      </div>
    </section>
  )
}
