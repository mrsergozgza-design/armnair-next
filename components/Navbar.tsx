'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, Phone, MessageCircle, Send } from 'lucide-react'

interface NavbarProps {
  activePage: 'home' | 'analytics'
  onNav: (page: 'home' | 'analytics', anchor?: string) => void
}

export default function Navbar({ activePage, onNav }: NavbarProps) {
  const [consultOpen, setConsultOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setConsultOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks: { label: string; page: 'home' | 'analytics'; anchor?: string }[] = [
    { label: 'КАРТА', page: 'home', anchor: 'split-panel' },
    { label: 'КАТАЛОГ', page: 'home', anchor: 'split-panel' },
    { label: 'АНАЛИТИКА', page: 'analytics' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      background: 'rgba(9,9,15,0.85)',
      borderBottom: '1px solid rgba(139,105,20,0.1)',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem',
    }}>
      {/* Logo */}
      <button onClick={() => onNav('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="none" stroke="#A07820" strokeWidth="1.5"/>
          <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#A07820" opacity="0.15"/>
          <polygon points="14,10 18,12.5 18,15.5 14,18 10,15.5 10,12.5" fill="#C9A96E" opacity="0.7"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: '#F0EDE8', letterSpacing: '0.04em' }}>ArmNair</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#A07820', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Ереван · Армения</span>
        </div>
      </button>

      {/* Center nav */}
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {navLinks.map(link => {
          const isActive = activePage === link.page && (!link.anchor || link.page === 'analytics')
          return (
            <button
              key={link.label}
              onClick={() => onNav(link.page, link.anchor)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                letterSpacing: '0.12em', fontWeight: 400,
                color: isActive ? '#C9A96E' : '#9A9A9A',
                position: 'relative', padding: '4px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#C9A96E' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = isActive ? '#C9A96E' : '#9A9A9A' }}
            >
              {link.label}
              <span style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: '#A07820',
                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.25s ease',
                transformOrigin: 'left',
              }}/>
            </button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9A9A9A', padding: 6, display: 'flex', alignItems: 'center',
        }}>
          <Search size={16} />
        </button>

        {/* Consultation button with dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setConsultOpen(v => !v)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em',
              padding: '0.45rem 1.1rem', borderRadius: 100,
              border: '1px solid rgba(160,120,32,0.5)',
              background: 'rgba(160,120,32,0.08)',
              color: '#C9A96E', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            КОНСУЛЬТАЦИЯ
          </button>

          {consultOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: '#16161F', border: '1px solid rgba(139,105,20,0.25)',
              borderRadius: 8, padding: '0.75rem', minWidth: 240,
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 2000,
            }}>
              <a href="https://wa.me/971528892559" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0.5rem', color: '#F0EDE8', textDecoration: 'none', borderRadius: 4, fontSize: '0.85rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MessageCircle size={15} color="#25D366" />
                <span>WhatsApp</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9A9A9A' }}>+971 52 889 2559</span>
              </a>
              <a href="https://t.me/NazaryanDubai" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0.5rem', color: '#F0EDE8', textDecoration: 'none', borderRadius: 4, fontSize: '0.85rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Send size={15} color="#2AABEE" />
                <span>Telegram</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9A9A9A' }}>@NazaryanDubai</span>
              </a>
              <a href="tel:+37494108303"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 0.5rem', color: '#F0EDE8', textDecoration: 'none', borderRadius: 4, fontSize: '0.85rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Phone size={15} color="#C9A96E" />
                <span>Телефон</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9A9A9A' }}>+374 94 108 303</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
