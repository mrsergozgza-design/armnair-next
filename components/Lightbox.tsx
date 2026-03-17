'use client'
import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  startIndex?: number
  onClose: () => void
}

export default function Lightbox({ images, startIndex = 0, onClose }: Props) {
  const [idx, setIdx] = useState(startIndex)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  setIdx(i => (i + 1) % images.length)
      if (e.key === 'ArrowLeft')   setIdx(i => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  const btnBase: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '50%', width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', zIndex: 2,
    transition: 'background 0.15s',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, zIndex: 3,
        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%', width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff',
      }}>
        <X size={16} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.1em',
        }}>
          {idx + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); prev() }} style={{ ...btnBase, left: 16 }}>
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Image */}
      <img
        src={images[idx]}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 2 }}
      />

      {/* Next */}
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); next() }} style={{ ...btnBase, right: 16 }}>
          <ChevronRight size={20} />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 7,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{
                width: i === idx ? 18 : 7, height: 7, borderRadius: 4, border: 'none',
                background: i === idx ? '#C9A96E' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
