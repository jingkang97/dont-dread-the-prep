import { enGB, ms, ta, zhCN } from 'date-fns/locale'
import type { Lang } from '../i18n/strings'

export const DATE_LOCALES: Record<Lang, typeof enGB> = {
  en: enGB,
  zh: zhCN,
  ms,
  ta,
}

export type DatePattern = 'sessionWhen' | 'sessionWhenCompact' | 'ymd' | 'dayHeader' | 'dateTime' | 'time'

const EN_PATTERNS: Record<DatePattern, string> = {
  sessionWhen: 'd MMM, h:mm a',
  sessionWhenCompact: 'd MMM, h:mmaaa',
  ymd: 'EEE d MMM yyyy',
  dayHeader: 'EEE d MMM',
  dateTime: 'EEE d MMM, h:mm a',
  time: 'h:mm a',
}

export const DATE_PATTERNS: Record<Lang, Record<DatePattern, string>> = {
  en: EN_PATTERNS,
  zh: {
    sessionWhen: 'M月 d 日 a h:mm',
    sessionWhenCompact: 'M月 d 日 a h:mm',
    ymd: 'yyyy年 M月 d 日',
    dayHeader: 'EEE M月 d 日',
    dateTime: 'EEE M月 d 日 a h:mm',
    time: 'a h:mm',
  },
  ms: EN_PATTERNS,
  ta: EN_PATTERNS,
}
