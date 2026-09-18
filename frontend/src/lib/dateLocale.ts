import { enGB, ms, ta, zhCN } from 'date-fns/locale'
import type { Lang } from '../i18n/strings'

export const DATE_LOCALES: Record<Lang, typeof enGB> = {
  en: enGB,
  zh: zhCN,
  ms,
  ta,
}
