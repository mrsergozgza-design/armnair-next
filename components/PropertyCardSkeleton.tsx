export default function PropertyCardSkeleton() {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border-c)',
      borderRadius: 2, overflow: 'hidden', boxShadow: 'var(--card-shadow)',
    }}>
      <div className="skeleton-pulse" style={{ height: 190 }} />
      <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton-pulse" style={{ height: 10, width: '35%', borderRadius: 2 }} />
          <div className="skeleton-pulse" style={{ height: 10, width: '20%', borderRadius: 2 }} />
        </div>
        <div className="skeleton-pulse" style={{ height: 22, width: '75%', borderRadius: 2 }} />
        <div className="skeleton-pulse" style={{ height: 16, width: '50%', borderRadius: 2 }} />
        <div className="skeleton-pulse" style={{ height: 36, borderRadius: 2 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton-pulse" style={{ height: 10, width: '30%', borderRadius: 2 }} />
          <div className="skeleton-pulse" style={{ height: 10, width: '25%', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}
