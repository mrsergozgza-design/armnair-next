'use client'
import { memo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle, freshLabel, priceGrowth } from '@/lib/utils'
import { ArrowRight, Heart, GitCompare, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'
import { useT, useTStatus, useTDistrict } from '@/lib/StaticTranslationProvider'
import { useAutoTranslate } from '@/lib/useAutoTranslate'
import { useToast } from '@/lib/ToastContext'

// Тёмный 1×1 placeholder пока грузится реальное фото
const BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII='

interface Props {
  complex: Complex
  onClick: () => void
  onHover?: (id: string | null) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  inCompare?: boolean
  onToggleCompare?: () => void
}

function PropertyCard({ complex: c, onClick, onHover, isFavorite = false, onToggleFavorite, inCompare = false, onToggleCompare }: Props) {
  const { lang } = useLang()
  const tr = useT()
  const { showToast } = useToast()
  const tStatus = useTStatus()
  const tDistrict = useTDistrict()
  const ss = statusStyle(c.status)
  const fresh = freshLabel(c.last_updated, lang)
  const growth = priceGrowth(c.history)
  const [heartAnim, setHeartAnim] = useState(false)
  const translatedDesc = useAutoTranslate(c.description, lang, c.id, 'description', 'ru')
  const [slideIdx, setSlideIdx] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [imgLoaded, setImgLoaded] = useState<boolean[]>([])
  const [imgError, setImgError] = useState<boolean[]>([])
  const touchStartX = useRef(0)

  // Все фото уже в DOM — переключение только через opacity
  const allImages = c.images ?? (c.image ? [c.image] : [])

  const handleHeart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setHeartAnim(true)
    onToggleFavorite?.()
    showToast(tr(isFavorite ? 'toast.removedFromFavorites' : 'toast.addedToFavorites'))
  }, [onToggleFavorite, isFavorite, showToast, tr])

  const favBorder = isFavorite
    ? '1px solid rgba(201,169,110,0.55)'
    : '1px solid var(--border-c)'
  const favShadow = isFavorite
    ? '0 0 0 1px rgba(201,169,110,0.18), 0 4px 24px rgba(160,120,32,0.18)'
    : 'var(--card-shadow)'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)', border: favBorder,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.28s, transform 0.28s, box-shadow 0.28s, background 0.25s',
        borderRadius: 2, boxShadow: favShadow,
        touchAction: 'manipulation',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(160,120,32,0.4)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
        setHovering(true)
        onHover?.(c.id)
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isFavorite ? 'rgba(201,169,110,0.55)' : 'var(--border-c)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = favShadow
        setHovering(false)
        onHover?.(null)
      }}
    >
      {/* Image / Slider */}
      <div
        style={{ position: 'relative', height: 190, background: 'var(--surface)', overflow: 'hidden' }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (allImages.length <= 1) return
          const diff = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(diff) > 40) {
            if (diff > 0) setSlideIdx(i => (i + 1) % allImages.length)
            else setSlideIdx(i => (i - 1 + allImages.length) % allImages.length)
          }
        }}
      >

        {allImages.length > 0 ? (
          <>
            {/* Все фото рендерятся сразу — переключение через opacity */}
            {allImages.map((url, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', inset: 0,
                  opacity: i === slideIdx ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {imgError[i] ? (
                  /* Error fallback — серый блок с иконкой дома */
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'var(--card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Home size={32} color="var(--tm)" strokeWidth={1} />
                  </div>
                ) : (
                  <>
                    {/* Skeleton — виден пока фото не загрузилось */}
                    {!imgLoaded[i] && (
                      <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                    )}
                    <Image
                      src={url}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={75}
                      priority={i === 0}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      style={{ objectFit: 'cover', filter: 'brightness(var(--img-brightness))' }}
                      onLoad={() => setImgLoaded(prev => { const n = [...prev]; n[i] = true; return n })}
                      onError={() => setImgError(prev => { const n = [...prev]; n[i] = true; return n })}
                    />
                  </>
                )}
              </div>
            ))}

            {/* Стрелки — появляются при наведении */}
            {hovering && allImages.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setSlideIdx(i => (i - 1 + allImages.length) % allImages.length) }}
                  style={{
                    position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%', width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff', zIndex: 5,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setSlideIdx(i => (i + 1) % allImages.length) }}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%', width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff', zIndex: 5,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
                >
                  <ChevronRight size={15} />
                </button>
              </>
            )}

            {/* Точки-индикаторы */}
            {allImages.length > 1 && (
              <div style={{
                position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 5, zIndex: 4,
              }}>
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setSlideIdx(i) }}
                    style={{
                      width: i === slideIdx ? 16 : 6, height: 6, borderRadius: 3,
                      background: i === slideIdx ? '#C9A96E' : 'rgba(255,255,255,0.45)',
                      border: 'none', padding: 0, cursor: 'pointer',
                      transition: 'width 0.2s, background 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={32} color="var(--tm)" strokeWidth={1} />
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'var(--img-overlay)', pointerEvents: 'none' }} />

        {c.tax_refund && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(42,157,143,0.85)', borderRadius: 2,
            padding: '2px 7px', fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
            letterSpacing: '0.08em', color: '#fff',
          }}>{tr('card.taxRefund')}</div>
        )}

        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,0.55)', border: 'none',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          borderRadius: 2, padding: '2px 8px',
          fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
          letterSpacing: '0.06em', color: '#ffffff',
        }}>{tStatus(c.status)}</div>

        {/* Compare button */}
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); onToggleCompare?.() }}
          title={inCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'}
          style={{
            position: 'absolute', bottom: 10, right: 44,
            background: inCompare ? 'rgba(160,120,32,0.35)' : 'rgba(0,0,0,0.45)',
            border: inCompare ? '1px solid rgba(201,169,110,0.6)' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s', zIndex: 10,
          }}
        >
          <GitCompare size={12} color={inCompare ? '#C9A96E' : 'rgba(255,255,255,0.75)'} />
        </button>

        {/* Heart button */}
        <button
          onClick={handleHeart}
          onAnimationEnd={() => setHeartAnim(false)}
          className={heartAnim ? 'heart-pop' : ''}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.45)',
            border: isFavorite ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
            zIndex: 10,
          }}
        >
          <Heart
            size={13}
            fill={isFavorite ? '#C9A96E' : 'none'}
            color={isFavorite ? '#C9A96E' : 'rgba(255,255,255,0.75)'}
          />
        </button>

        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
          color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em',
        }}>{tDistrict(c.district)}</div>
      </div>

      {/* Body */}
      <div style={{ padding: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--t3)', letterSpacing: '0.08em' }}>
            {c.developer}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--teal)',
            background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.22)',
            borderRadius: 2, padding: '1px 6px',
          }}>{c.payment_plan ?? c.yield}</span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 400, color: 'var(--t1)', margin: '0 0 0.55rem 0', lineHeight: 1.1 }}>
          {c.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: '0.6rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--gold-b)', fontWeight: 500 }}>
            ${c.price_usd.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t3)' }}>
            {fmtAmd(c.price_amd)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--tm)' }}>/м²</span>
        </div>

        {/* Metrics strip */}
        <div style={{
          display: 'flex', gap: 0,
          borderTop: '1px solid var(--border-c)', borderBottom: '1px solid var(--border-c)',
          margin: '0 -0.8rem 0.6rem -0.8rem', padding: '0.35rem 0.8rem',
        }}>
          {[
            { label: c.unit_type ? tr('card.type') : tr('card.yield'), value: c.unit_type ?? c.yield },
            { label: c.min_area ? tr('card.area') : tr('card.growth'), value: c.min_area ? `${tr('card.from')} ${c.min_area}м²` : (growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`) },
            { label: tr('card.district'), value: tDistrict(c.district.split('-')[0]) },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--tm)', letterSpacing: '0.06em', marginBottom: 1 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--t2)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Description snippet */}
        {c.description && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--t3)',
            lineHeight: 1.5, margin: '0 0 0.5rem 0',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {translatedDesc}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 3 }}>
            {tr('card.more')} <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(PropertyCard)
