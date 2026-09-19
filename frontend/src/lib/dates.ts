import { format } from 'date-fns'
import type { Lang } from '../i18n/strings'
import { DATE_LOCALES, DATE_PATTERNS, type DatePattern } from './dateLocale'

export function formatByLang(date: Date, lang: Lang, pattern: DatePattern) {
  return format(date, DATE_PATTERNS[lang][pattern], { locale: DATE_LOCALES[lang] })
}

export function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toYmd(date: Date) {
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${day}`
}

export function plusDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toYmd(d)
}

export function isBeforeToday(ymd: string) {
  return ymd < toYmd(new Date())
}

export function formatHm(hm: string, lang: Lang = 'en') {
  const [h, min] = hm.split(':').map(Number)
  return formatByLang(new Date(2000, 0, 1, h, min), lang, 'time')
}

export function quarterHours(startHm: string, endHm: string, step = 15) {
  const toMin = (hm: string) => {
    const [h, m] = hm.split(':').map(Number)
    return h * 60 + m
  }
  const fromMin = (n: number) => {
    const h = Math.floor(n / 60)
    const m = n % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const out: string[] = []
  for (let n = toMin(startHm); n <= toMin(endHm); n += step) out.push(fromMin(n))
  return out
}

export function formatYmd(ymd: string, lang: Lang) {
  return formatByLang(parseYmd(ymd), lang, 'ymd')
}

export function sessionReportAt(session: { date: string; reportingTime: string }) {
  return new Date(`${session.date}T${session.reportingTime}:00`)
}

export function formatSessionWhen(session: { date: string; reportingTime: string }, lang: Lang) {
  return formatByLang(sessionReportAt(session), lang, 'sessionWhen')
}
