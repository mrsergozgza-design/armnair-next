'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import Toast from '@/components/Toast'

type ToastCtx = { showToast: (message: string) => void }
const Ctx = createContext<ToastCtx>({ showToast: () => {} })

export function useToast() { return useContext(Ctx) }

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(msg)
    setVisible(true)
    timerRef.current = setTimeout(() => setVisible(false), 3000)
  }, [])

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <Toast message={message} visible={visible} />
    </Ctx.Provider>
  )
}
