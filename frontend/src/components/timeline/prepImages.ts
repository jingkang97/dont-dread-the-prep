function normalizeFilename(label: string): string | null {
  const base = label.trim().replace(/^.*[/\\]/, '')
  if (!base) return null
  const withExt = base.endsWith('.png') ? base : `${base}.png`
  if (!/^[\w-]+\.png$/.test(withExt)) return null
  return withExt
}

/** Resolve protocol_steps.prep_image_label to a public /timeline/*.png URL. */
export function resolvePrepImageSrc(prepImageLabel: string | null | undefined): string | null {
  if (!prepImageLabel) return null
  const filename = normalizeFilename(prepImageLabel)
  return filename ? `/timeline/${filename}` : null
}
