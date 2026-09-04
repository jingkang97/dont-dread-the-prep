import { enGB, ms, ta, zhCN } from 'date-fns/locale'
import type { Lang } from '../i18n/strings'

/** date-fns locale per app language, so weekdays, months and distances follow the buttons. */
export const DATE_LOCALES: Record<Lang, typeof enGB> = { en: enGB, zh: zhCN, ms, ta }
