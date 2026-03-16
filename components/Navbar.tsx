'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, Phone, MessageCircle, Send, Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface NavbarProps {
  activePage: 'home' | 'analytics'
  onNav: (page: 'home' | 'analytics', anchor?: string) => void
}

export default function Navbar({ activePage, onNav }: NavbarProps) {
  const { theme, toggle } = useTheme()
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
    { label: 'КАРТА',      page: 'home',      anchor: 'split-panel' },
    { label: 'КАТАЛОГ',    page: 'home',      anchor: 'split-panel' },
    { label: 'АНАЛИТИКА',  page: 'analytics' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--border-c)',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Logo */}
      <button
        onClick={() => onNav('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="none" stroke="var(--gold)" strokeWidth="1.5"/>
          <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="var(--gold)" opacity="0.15"/>
          <polygon points="14,10 18,12.5 18,15.5 14,18 10,15.5 10,12.5" fill="var(--gold-b)" opacity="0.7"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--t1)', letterSpacing: '0.04em' }}>
            ArmNair
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
            Ереван · Армения
          </span>
        </div>
      </button>

      {/* Center nav */}
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {navLinks.map(link => {
          const isActive = activePage === link.page && (link.page === 'analytics' || link.page === 'home')
          const isAnalyticsActive = link.page === 'analytics' && activePage === 'analytics'
          const isHomeActive = link.page === 'home' && activePage === 'home'
          const active = isAnalyticsActive || isHomeActive
          return (
            <button
              key={link.label}
              onClick={() => onNav(link.page, link.anchor)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.66rem',
                letterSpacing: '0.12em', fontWeight: 400,
                color: active ? 'var(--gold)' : 'var(--t3)',
                position: 'relative', padding: '4px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? 'var(--gold)' : 'var(--t3)' }}
            >
              {link.label}
              <span style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: 'var(--gold)',
                transform: active ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.25s ease',
                transformOrigin: 'left',
              }}/>
            </button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--t3)', padding: 6, display: 'flex', alignItems: 'center',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
        >
          <Search size={15} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          style={{
            background: 'none', border: '1px solid var(--border-c)', borderRadius: 100,
            cursor: 'pointer', color: 'var(--t3)',
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--gold)'
            e.currentTarget.style.color = 'var(--gold)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-c)'
            e.currentTarget.style.color = 'var(--t3)'
          }}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Consultation dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setConsultOpen(v => !v)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.66rem', letterSpacing: '0.1em',
              padding: '0.42rem 1rem', borderRadius: 100,
              border: '1px solid rgba(160,120,32,0.4)',
              background: 'rgba(160,120,32,0.07)',
              color: 'var(--gold)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.07)')}
          >
            КОНСУЛЬТАЦИЯ
          </button>

          {consultOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'var(--popup-bg)',
              border: '1px solid var(--border-c)',
              borderRadius: 8, padding: '0.6rem',
              minWidth: 240,
              boxShadow: 'var(--card-shadow-hover)',
              zIndex: 2000,
              transition: 'background 0.25s',
            }}>
              {[
                { href:'https://wa.me/971528892559', icon:<MessageCircle size={14} color="#25D366"/>, label:'WhatsApp', detail:'+971 52 889 2559' },
                { href:'https://t.me/NazaryanDubai', icon:<Send size={14} color="#2AABEE"/>, label:'Telegram', detail:'@NazaryanDubai' },
                { href:'tel:+37494108303', icon:<Phone size={14} color="var(--gold)"/>, label:'Телефон', detail:'+374 94 108 303' },
              ].map(({ href, icon, label, detail }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'0.5rem 0.5rem', color:'var(--t1)', textDecoration:'none', borderRadius:4, fontSize:'0.88rem', transition:'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {icon}
                  <span style={{ fontFamily:'var(--font-sans)' }}>{label}</span>
                  <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:'0.66rem', color:'var(--t3)' }}>{detail}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
