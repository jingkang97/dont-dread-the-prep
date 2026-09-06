import type { ReactNode } from 'react'

/** Turns `**bold**` into `<strong>` nodes. Leaves other text as-is (no HTML). */
export function inlineMarkdown(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part)
    return bold ? <strong key={i}>{bold[1]}</strong> : part
  })
}
