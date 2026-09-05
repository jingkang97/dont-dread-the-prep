import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '../lib/cn'

const SPRING = { type: 'spring' as const, stiffness: 480, damping: 38 }

function labelKey(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(labelKey).join('')
  if (typeof node === 'object' && 'props' in node) {
    return labelKey((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  buttonClassName,
}: {
  value: T
  options: { id: T; label: ReactNode }[]
  onChange: (id: T) => void
  group?: string
  className?: string
  buttonClassName?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef(new Map<T, HTMLButtonElement>())
  const valueRef = useRef(value)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [slide, setSlide] = useState(false)
  const labels = options.map((o) => `${o.id}:${labelKey(o.label)}`).join('|')

  function place(next: T, animate: boolean) {
    const btn = btnRefs.current.get(next)
    if (!btn) return
    setSlide(animate)
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }

  useLayoutEffect(() => {
    const moved = valueRef.current !== value
    valueRef.current = value
    place(value, moved)
  }, [value, labels])

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => place(valueRef.current, false))
    const track = trackRef.current
    if (track) ro.observe(track)
    btnRefs.current.forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [labels])

  return (
    <div
      ref={trackRef}
      className={cn('relative flex overflow-hidden rounded-[10px] bg-black/5 p-[3px]', className)}
    >
      {thumb.ready && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[3px] bottom-[3px] left-0 rounded-[8px] bg-white shadow-sm"
          initial={false}
          animate={{ x: thumb.x, width: thumb.w }}
          transition={slide ? SPRING : { duration: 0 }}
        />
      )}
      {options.map((item) => {
        const active = value === item.id
        return (
          <button
            key={item.id}
            ref={(el) => {
              if (el) btnRefs.current.set(item.id, el)
              else btnRefs.current.delete(item.id)
            }}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'relative z-10 min-w-0 flex-1 rounded-[8px] px-1 text-[13px] font-semibold outline-none',
              buttonClassName,
              active ? 'text-ink' : 'text-muted',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
