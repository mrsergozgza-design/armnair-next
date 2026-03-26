'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(false)
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <div style={{
      opacity: show ? 1 : 0,
      transition: 'opacity 0.25s ease',
    }}>
      {children}
    </div>
  )
}
