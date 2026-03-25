'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, Phone, MessageCircle, Send, Sun, Moon, Heart, GitCompare, Globe } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useLang, type Lang } from '@/lib/LanguageContext'
import { useT } from '@/lib/StaticTranslationProvider'

interface NavbarProps {
  activePage: 'home' | 'analytics' | 'catalog'
  onNav: (page: 'home' | 'analytics' | 'catalog', anchor?: string) => void
  favCount?: number
  favOnly?: boolean
  onFavFilter?: () => void
  compareCount?: number
  onOpenCompare?: () => void
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'am', label: 'ՀԱ' },
]

export default function Navbar({ activePage, onNav, favCount = 0, favOnly = false, onFavFilter, compareCount = 0, onOpenCompare }: NavbarProps) {
  const { theme, toggle, mounted } = useTheme()
  const { lang, setLang } = useLang()
  const tr = useT()
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

  const navLinks: { key: 'nav.home' | 'nav.catalog' | 'nav.analytics'; page: 'home' | 'analytics' | 'catalog' }[] = [
    { key: 'nav.home',      page: 'home' },
    { key: 'nav.catalog',   page: 'catalog' },
    { key: 'nav.analytics', page: 'analytics' },
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
        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onNav('home') }}
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
          <span className="nav-logo-sub" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--gold)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
            {tr('nav.yerevan')}
          </span>
        </div>
      </button>

      {/* Center nav — hidden on mobile (tab bar handles navigation) */}
      <div className="nav-center" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {navLinks.map(link => {
          const active = activePage === link.page
          return (
            <button
              key={link.page}
              onClick={() => {
                if (activePage === link.page) {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  onNav(link.page)
                }
              }}
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
              {tr(link.key)}
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
        {/* Search — hidden on mobile */}
        <button className="nav-right-extra"
          onClick={() => {
            const el = document.getElementById('filter-search-input')
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus() }
          }}
          style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--t3)', padding: 6, display: 'flex', alignItems: 'center',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
        >
          <Search size={15} />
        </button>

        {/* Language switcher */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          background: 'rgba(160,120,32,0.06)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(160,120,32,0.3)',
          borderRadius: 100,
          padding: '3px 6px 3px 8px',
        }}>
          <Globe size={12} color="var(--gold)" style={{ flexShrink: 0 }} />
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                background: lang === code ? 'rgba(160,120,32,0.25)' : 'transparent',
                border: lang === code ? '1px solid rgba(201,169,110,0.5)' : '1px solid transparent',
                borderRadius: 100,
                cursor: 'pointer',
                fontFamily: lang === code && code === 'am' ? 'var(--font-armenian)' : 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.06em',
                color: lang === code ? 'var(--gold)' : 'var(--t3)',
                padding: '3px 8px',
                transition: 'all 0.2s',
                lineHeight: 1,
              }}
              onMouseEnter={e => {
                if (lang !== code) {
                  e.currentTarget.style.color = 'var(--gold)'
                  e.currentTarget.style.background = 'rgba(160,120,32,0.1)'
                }
              }}
              onMouseLeave={e => {
                if (lang !== code) {
                  e.currentTarget.style.color = 'var(--t3)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Compare button — hidden on mobile (tab bar) */}
        {compareCount > 0 && (
          <button className="nav-right-extra"
            onClick={onOpenCompare}
            style={{
              background: 'rgba(160,120,32,0.12)',
              border: '1px solid rgba(160,120,32,0.4)',
              borderRadius: 100, cursor: 'pointer',
              color: '#C9A96E',
              padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.12)')}
          >
            <GitCompare size={14} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', lineHeight: 1 }}>
              {compareCount}
            </span>
          </button>
        )}

        {/* Favorites filter — hidden on mobile (tab bar) */}
        <button className="nav-right-extra"
          onClick={onFavFilter}
          style={{
            background: favOnly ? 'rgba(201,169,110,0.15)' : 'none',
            border: favOnly ? '1px solid rgba(201,169,110,0.4)' : 'none',
            borderRadius: 100, cursor: 'pointer',
            color: favOnly ? '#C9A96E' : 'var(--t3)',
            padding: favOnly ? '4px 10px' : 6,
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#C9A96E')}
          onMouseLeave={e => (e.currentTarget.style.color = favOnly ? '#C9A96E' : 'var(--t3)')}
        >
          <Heart size={15} fill={favOnly ? '#C9A96E' : 'none'} color={favOnly ? '#C9A96E' : 'currentColor'} />
          {favCount > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', lineHeight: 1 }}>
              {favCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
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
          {!mounted ? <Moon size={14} /> : theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Consultation dropdown — hidden on mobile */}
        <div className="nav-right-extra" ref={dropRef} style={{ position: 'relative' }}>
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
            {tr('nav.consult')}
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
                { href:'tel:+37494108303', icon:<Phone size={14} color="var(--gold)"/>, label: tr('contact.phone'), detail:'+374 94 108 303' },
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
