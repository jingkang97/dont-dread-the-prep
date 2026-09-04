import { useState } from 'react'
import { motion } from 'motion/react'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import { cn } from '../lib/cn'
import { easeOut } from '../lib/motion'
import { PrimaryButton } from './ui'
import shortcutIos from '../assets/shortcut-ios.png'
import shortcutAndroid from '../assets/shortcut-android.png'

const IOS_STEPS: StringKey[] = [
  'home.shortcutIos1',
  'home.shortcutIos2',
  'home.shortcutIos3',
  'home.shortcutIos4',
]

const ANDROID_STEPS: StringKey[] = [
  'home.shortcutAndroid1',
  'home.shortcutAndroid2',
  'home.shortcutAndroid3',
  'home.shortcutAndroid4',
]

export function ShortcutSheet({
  initialOs,
  onClose,
}: {
  initialOs: 'ios' | 'android'
  onClose: () => void
}) {
  const { t } = useLang()
  const [os, setOs] = useState<'ios' | 'android'>(initialOs)
  const ios = os === 'ios'

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-end justify-center px-4 pb-4 pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: easeOut }}
    >
      <button type="button" aria-label={t('on.back')} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        className="relative flex max-h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: easeOut }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-3 pt-5">
          <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{t('home.shortcut')}</p>
          <div className="mt-3 flex h-9 rounded-[10px] bg-black/5 p-0.75">
            {(['ios', 'android'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setOs(id)}
                className={cn(
                  'flex min-w-0 flex-1 items-center justify-center rounded-lg px-1 text-[13px] font-semibold transition',
                  os === id ? 'bg-white text-ink shadow-sm' : 'text-muted',
                )}
              >
                {t(id === 'ios' ? 'home.shortcutIosTab' : 'home.shortcutAndroidTab')}
              </button>
            ))}
          </div>
          <img
            src={ios ? shortcutIos : shortcutAndroid}
            alt={t(ios ? 'home.shortcutImgIos' : 'home.shortcutImgAndroid')}
            className="mt-4 w-full rounded-2xl bg-paper"
          />
          <p className="mt-4 text-[13px] font-semibold text-teal-deep">
            {t(ios ? 'home.shortcutIosLead' : 'home.shortcutAndroidLead')}
          </p>
          <ol className="mt-2 space-y-2.5">
            {(ios ? IOS_STEPS : ANDROID_STEPS).map((key, i) => (
              <li key={key} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream text-[12px] font-bold text-teal-deep">
                  {i + 1}
                </span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="shrink-0 px-5 pb-5 pt-2">
          <PrimaryButton onClick={onClose}>{t('home.shortcutGotIt')}</PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
