import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

const EDGE = 28
const COMMIT = 0.22
const FLICK = 650

/**
 * iOS-style swipe-from-left-edge. `shift` is 0..1 (how far the page has been pulled aside).
 */
export function useEdgeSwipeBack(active: boolean, onBack: () => void) {
  const [shift, setShift] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef({
    armed: false,
    tracking: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastT: 0,
    vx: 0,
    width: 1,
    pointerId: -1,
  })
  const shiftRef = useRef(0)

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!active) return
      if (e.pointerType === 'mouse' && e.buttons !== 1) return
      const rect = e.currentTarget.getBoundingClientRect()
      if (e.clientX - rect.left > EDGE) return
      const g = gesture.current
      g.armed = true
      g.tracking = false
      g.startX = e.clientX
      g.startY = e.clientY
      g.lastX = e.clientX
      g.lastT = e.timeStamp
      g.vx = 0
      g.width = Math.max(rect.width, 1)
      g.pointerId = e.pointerId
    },
    [active],
  )

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const g = gesture.current
    if (!g.armed && !g.tracking) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (!g.tracking) {
      if (dx < 10 && Math.abs(dy) < 10) return
      if (Math.abs(dy) >= dx) {
        g.armed = false
        return
      }
      g.tracking = true
      g.armed = false
      try {
        e.currentTarget.setPointerCapture(g.pointerId)
      } catch {
        /* ignore */
      }
      setDragging(true)
    }
    const dt = Math.max(1, e.timeStamp - g.lastT)
    g.vx = ((e.clientX - g.lastX) / dt) * 1000
    g.lastX = e.clientX
    g.lastT = e.timeStamp
    const next = Math.min(1, Math.max(0, dx / g.width))
    shiftRef.current = next
    setShift(next)
  }, [])

  const finish = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const g = gesture.current
      const wasDragging = g.tracking
      g.armed = false
      g.tracking = false
      try {
        e.currentTarget.releasePointerCapture(g.pointerId)
      } catch {
        /* already released */
      }
      if (!wasDragging) return
      const go = shiftRef.current > COMMIT || g.vx > FLICK
      shiftRef.current = 0
      setDragging(false)
      setShift(0)
      if (go) onBack()
    },
    [onBack],
  )

  return {
    shift,
    dragging,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  }
}
