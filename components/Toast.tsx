'use client'

interface Props {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      background: 'rgba(30,30,30,0.95)',
      borderLeft: '3px solid #b8942a',
      borderRadius: 8,
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      color: '#fff',
      fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
      letterSpacing: '0.04em',
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.25s ease, opacity 0.25s ease',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ color: '#2A9D8F', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>✓</span>
      {message}
    </div>
  )
}
