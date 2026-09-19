import { cn } from '../../lib/cn'

type Residue = 0 | 1 | 2 | 3 | 4 | 5

const TTSH_RESIDUE: Residue[] = [5, 4, 3, 2, 1, 0]
const SKH_RESIDUE: Residue[] = [5, 4, 3, 2, 1]

export function StoolCartoon({
  scaleKey,
  n,
  color,
  className,
}: {
  scaleKey: string
  n: number
  color: string
  className?: string
}) {
  const residue = (scaleKey === 'skh-6' ? SKH_RESIDUE : TTSH_RESIDUE)[n - 1] ?? 0
  if (scaleKey === 'skh-6') {
    return <JarCartoon color={color} residue={residue} className={className} uid={`${scaleKey}-${n}`} />
  }
  return <BowlCartoon color={color} residue={residue} className={className} uid={`${scaleKey}-${n}`} />
}

function BowlCartoon({
  color,
  residue,
  className,
  uid,
}: {
  color: string
  residue: Residue
  className?: string
  uid: string
}) {
  const clip = `stool-bowl-${uid}`
  const cloudy = residue >= 3
  return (
    <svg viewBox="0 0 160 168" className={cn('h-full w-full', className)} aria-hidden>
      <ellipse cx="80" cy="86" rx="68" ry="58" fill="#f4efe6" stroke="#d7cbb6" strokeWidth="3" />
      <ellipse cx="80" cy="86" rx="54" ry="44" fill="#fff" />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="80" cy="90" rx="50" ry="40" fill={color} opacity={liquidOpacity(residue)} />
        {cloudy ? <CloudDots color={darken(color)} /> : null}
        <ResidueBits residue={residue} color={darken(color)} />
      </g>
      <ellipse cx="80" cy="86" rx="54" ry="44" fill="none" stroke="#c9bfa8" strokeWidth="2.2" />
      <ellipse cx="62" cy="68" rx="14" ry="8" fill="#fff" opacity="0.35" />
      <defs>
        <clipPath id={clip}>
          <ellipse cx="80" cy="90" rx="50" ry="40" />
        </clipPath>
      </defs>
    </svg>
  )
}

function JarCartoon({
  color,
  residue,
  className,
  uid,
}: {
  color: string
  residue: Residue
  className?: string
  uid: string
}) {
  const clip = `stool-jar-${uid}`
  const inner =
    'M42 56h56l-5 102a11 11 0 0 1-11 9H58a11 11 0 0 1-11-9L42 56Z'
  return (
    <svg viewBox="0 0 140 176" className={cn('h-full w-full', className)} aria-hidden>
      <path
        d="M38 48h64l-6 110a14 14 0 0 1-14 12H58a14 14 0 0 1-14-12L38 48Z"
        fill="#f7f4ee"
        stroke="#cfc6b6"
        strokeWidth="2.4"
      />
      <g clipPath={`url(#${clip})`}>
        <path d={inner} fill={color} opacity={liquidOpacity(residue)} />
        {residue >= 2 ? <CloudDots color={darken(color)} jar count={residue >= 4 ? 3 : residue} /> : null}
        <ResidueBits residue={residue} color={darken(color)} jar />
      </g>
      <path d="M38 48h64" fill="none" stroke="#cfc6b6" strokeWidth="2.4" />
      <rect x="32" y="28" width="76" height="22" rx="8" fill="#34c759" />
      <rect x="36" y="32" width="68" height="8" rx="4" fill="#7be08f" opacity="0.7" />
      <path d="M48 58h44" stroke="#fff" strokeWidth="3" opacity="0.28" strokeLinecap="round" />
      <defs>
        <clipPath id={clip}>
          <path d={inner} />
        </clipPath>
      </defs>
    </svg>
  )
}

function CloudDots({ color, jar, count }: { color: string; jar?: boolean; count?: number }) {
  const dots = jar
    ? [
        [70, 108, 2.2],
        [58, 124, 1.8],
        [82, 132, 1.6],
      ]
    : [
        [58, 78, 3.4],
        [96, 84, 2.8],
        [74, 98, 3],
        [52, 104, 2.2],
        [102, 108, 2.6],
        [68, 116, 2.4],
      ]
  const shown = dots.slice(0, count ?? dots.length)
  return (
    <g fill={color} opacity="0.28">
      {shown.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  )
}

function ResidueBits({ residue, color, jar }: { residue: Residue; color: string; jar?: boolean }) {
  if (residue <= 0) return null
  const blobs = jar ? jarBlobs(residue, color) : bowlBlobs(residue, color)
  return <g>{blobs}</g>
}

function bowlBlobs(residue: Residue, color: string) {
  const all = [
    <ellipse key="a" cx="80" cy="108" rx="22" ry="12" fill={color} opacity="0.95" />,
    <ellipse key="b" cx="62" cy="98" rx="10" ry="7" fill={color} opacity="0.9" />,
    <ellipse key="c" cx="98" cy="100" rx="9" ry="6" fill={color} opacity="0.88" />,
    <ellipse key="d" cx="74" cy="88" rx="6" ry="4.5" fill={color} opacity="0.75" />,
    <ellipse key="e" cx="92" cy="90" rx="5" ry="3.8" fill={color} opacity="0.7" />,
    <circle key="f" cx="58" cy="90" r="3.2" fill={color} opacity="0.65" />,
    <circle key="g" cx="104" cy="94" r="2.8" fill={color} opacity="0.6" />,
  ]
  const count = residue === 5 ? 7 : residue === 4 ? 5 : residue === 3 ? 4 : residue === 2 ? 3 : 2
  return all.slice(0, count)
}

function jarBlobs(residue: Residue, color: string) {
  if (residue <= 0) return []
  if (residue === 1) {
    return [
      <circle key="a" cx="64" cy="150" r="1.7" fill={color} opacity="0.45" />,
      <circle key="b" cx="74" cy="148" r="1.3" fill={color} opacity="0.4" />,
      <circle key="c" cx="82" cy="151" r="1.5" fill={color} opacity="0.35" />,
    ]
  }
  if (residue === 2) {
    return [
      <ellipse key="a" cx="66" cy="149" rx="5" ry="2.4" fill={color} opacity="0.55" />,
      <circle key="b" cx="78" cy="147" r="2.1" fill={color} opacity="0.5" />,
      <circle key="c" cx="58" cy="146" r="1.8" fill={color} opacity="0.45" />,
      <circle key="d" cx="84" cy="150" r="1.6" fill={color} opacity="0.4" />,
      <circle key="e" cx="72" cy="144" r="1.4" fill={color} opacity="0.35" />,
    ]
  }
  if (residue === 3) {
    return [
      <ellipse key="a" cx="68" cy="148" rx="8" ry="3.4" fill={color} opacity="0.65" />,
      <ellipse key="b" cx="80" cy="146" rx="4.5" ry="2.6" fill={color} opacity="0.55" />,
      <circle key="c" cx="58" cy="145" r="2.4" fill={color} opacity="0.5" />,
      <circle key="d" cx="86" cy="150" r="2" fill={color} opacity="0.45" />,
      <circle key="e" cx="72" cy="142" r="1.8" fill={color} opacity="0.4" />,
      <circle key="f" cx="62" cy="140" r="1.5" fill={color} opacity="0.35" />,
      <circle key="g" cx="76" cy="138" r="1.4" fill={color} opacity="0.3" />,
    ]
  }
  const all = [
    <ellipse key="a" cx="70" cy="148" rx="18" ry="8" fill={color} opacity="0.95" />,
    <ellipse key="b" cx="58" cy="142" rx="7" ry="5" fill={color} opacity="0.9" />,
    <ellipse key="c" cx="84" cy="143" rx="6.5" ry="4.5" fill={color} opacity="0.88" />,
    <ellipse key="d" cx="70" cy="136" rx="5" ry="3.5" fill={color} opacity="0.75" />,
    <circle key="e" cx="54" cy="134" r="2.8" fill={color} opacity="0.65" />,
    <circle key="f" cx="88" cy="132" r="2.4" fill={color} opacity="0.6" />,
  ]
  return all.slice(0, residue === 5 ? 6 : 4)
}

function liquidOpacity(residue: Residue) {
  if (residue >= 4) return 0.98
  if (residue === 3) return 0.9
  if (residue === 2) return 0.8
  if (residue === 1) return 0.62
  return 0.48
}

function darken(hex: string) {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return '#3b2418'
  const n = parseInt(raw, 16)
  const r = Math.max(0, ((n >> 16) & 255) - 36)
  const g = Math.max(0, ((n >> 8) & 255) - 36)
  const b = Math.max(0, (n & 255) - 28)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
