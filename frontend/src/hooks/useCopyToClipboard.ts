import { useEffect, useRef, useState } from 'react'

function legacyCopy(text: string) {
  const box = document.createElement('textarea')
  box.value = text
  box.setAttribute('readonly', '')
  box.style.position = 'fixed'
  box.style.opacity = '0'
  document.body.appendChild(box)
  box.select()
  document.execCommand('copy')
  document.body.removeChild(box)
}

export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function copy(text: string) {
    try {
      const write = navigator.clipboard?.writeText(text)
      if (write) write.catch(() => legacyCopy(text))
      else legacyCopy(text)
    } catch {
      legacyCopy(text)
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), resetMs)
  }

  return { copied, copy }
}
