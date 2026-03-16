'use client'
import { useEffect } from 'react'
import { X, Phone, MessageCircle, Send } from 'lucide-react'

interface ConsultModalProps {
  open: boolean
  onClose: () => void
}

export default function ConsultModal({ open, onClose }: ConsultModalProps) {
  useEffect(() => {
    if (open) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
    return () => { document.body.classList.remove('modal-open') }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null

  const contacts = [
    {
      icon: <MessageCircle size={18} color="#25D366" />,
      label: 'WhatsApp',
      value: '+971 52 889 2559',
      href: 'https://wa.me/971528892559',
      color: '#25D366',
      bg: 'rgba(37,211,102,0.08)',
      border: 'rgba(37,211,102,0.2)',
    },
    {
      icon: <Send size={18} color="#2AABEE" />,
      label: 'Telegram',
      value: '@NazaryanDubai',
      href: 'https://t.me/NazaryanDubai',
      color: '#2AABEE',
      bg: 'rgba(42,171,238,0.08)',
      border: 'rgba(42,171,238,0.2)',
    },
    {
      icon: <Phone size={18} color="#C9A96E" />,
      label: 'Телефон',
      value: '+374 94 108 303',
      href: 'tel:+37494108303',
      color: '#C9A96E',
      bg: 'rgba(160,120,32,0.08)',
      border: 'rgba(160,120,32,0.2)',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        maxWidth: 380, width: '100%',
        background: '#111118',
        border: '1px solid rgba(139,105,20,0.25)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        borderRadius: 4,
        overflow: 'hidden',
        animation: 'fadeUp 0.25s ease both',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem',
          borderBottom: '1px solid rgba(139,105,20,0.1)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9A9A9A',
            }}
          >
            <X size={16} />
          </button>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 400,
            color: '#F0EDE8', margin: '0 0 4px 0',
          }}>
            Связаться с нами
          </h3>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: '#555560', letterSpacing: '0.1em', margin: 0,
          }}>
            ArmNair · Ереван · Армения
          </p>
        </div>

        {/* Contacts */}
        <div style={{ padding: '1rem 1.5rem' }}>
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '0.85rem 1rem',
                marginBottom: 8,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 4,
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(4px)'
                e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#F0EDE8', fontWeight: 400 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: c.color, marginTop: 2 }}>{c.value}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(139,105,20,0.1)',
          padding: '0.75rem 1.5rem',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
          color: '#555560', letterSpacing: '0.06em',
        }}>
          Ответим в течение 15 минут · Пн–Вс 9:00–21:00
        </div>
      </div>
    </div>
  )
}
