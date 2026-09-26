import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { easeOut } from '../../lib/motion'

export function SheetFrame({
  children,
  onDismiss,
  dismissLabel,
}: {
  children: ReactNode
  onDismiss: () => void
  dismissLabel: string
}) {
  const armed = useRef(false)
  useEffect(() => {
    armed.current = false
    const t = window.setTimeout(() => {
      armed.current = true
    }, 400)
    return () => window.clearTimeout(t)
  }, [])

  function dismiss() {
    if (!armed.current) return
    onDismiss()
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: easeOut }}
    >
      <button
        type="button"
        data-demo="sheet-dismiss"
        aria-label={dismissLabel}
        className="absolute inset-0 bg-black/40"
        onClick={dismiss}
      />
      <motion.div
        className="relative w-full rounded-[24px] bg-white p-5 shadow-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: easeOut }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
