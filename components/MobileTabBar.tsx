'use client'
import { Home, LayoutGrid, Heart, GitCompare } from 'lucide-react'
import { useT } from '@/lib/StaticTranslationProvider'

interface Props {
  activePage: 'home' | 'analytics' | 'catalog'
  onNav: (page: 'home' | 'analytics' | 'catalog') => void
  favCount: number
  favOnly: boolean
  onFavFilter: () => void
  compareCount: number
  onOpenCompare: () => void
}

export default function MobileTabBar({ activePage, onNav, favCount, favOnly, onFavFilter, compareCount, onOpenCompare }: Props) {
  const tr = useT()

  const tabs = [
    {
      id: 'home',
      labelKey: 'tab.home',
      icon: (active: boolean) => <Home size={22} strokeWidth={active ? 2 : 1.5} />,
      onClick: () => onNav('home'),
      active: activePage === 'home' && !favOnly,
      badge: undefined as number | undefined,
    },
    {
      id: 'catalog',
      labelKey: 'tab.catalog',
      icon: (active: boolean) => <LayoutGrid size={22} strokeWidth={active ? 2 : 1.5} />,
      onClick: () => onNav('catalog'),
      active: activePage === 'catalog',
      badge: undefined as number | undefined,
    },
    {
      id: 'favorites',
      labelKey: 'tab.favorites',
      icon: (active: boolean) => <Heart size={22} strokeWidth={active ? 2 : 1.5} fill={active ? '#C9A96E' : 'none'} />,
      onClick: onFavFilter,
      active: favOnly,
      badge: favCount > 0 ? favCount : undefined,
    },
    {
      id: 'compare',
      labelKey: 'tab.compare',
      icon: (active: boolean) => <GitCompare size={22} strokeWidth={active ? 2 : 1.5} />,
      onClick: onOpenCompare,
      active: compareCount > 0,
      badge: compareCount > 0 ? compareCount : undefined,
    },
  ]

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        height: 64,
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--border-c)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={tab.onClick}
          style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab.active ? '#C9A96E' : 'var(--t3)',
            position: 'relative',
            padding: '8px 0',
            WebkitTapHighlightColor: 'transparent',
            transition: 'color 0.2s',
          }}
        >
          {tab.icon(tab.active)}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.48rem',
            letterSpacing: '0.06em', lineHeight: 1,
          }}>
            {tr(tab.labelKey)}
          </span>
          {tab.badge !== undefined && (
            <span style={{
              position: 'absolute', top: 6, right: 'calc(50% - 22px)',
              background: '#C9A96E', color: '#1A1A1A',
              borderRadius: '50%', minWidth: 16, height: 16,
              fontFamily: 'var(--font-mono)', fontSize: '0.5rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px',
            }}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
