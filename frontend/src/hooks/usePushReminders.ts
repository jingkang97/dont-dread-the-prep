import { useState } from 'react'
import { disablePush, enablePush, isStandaloneDisplay, preferredShortcutOs, pushSupported } from '../lib/push'
import type { PrepSession } from '../lib/session'
import { useLang } from '../i18n/LanguageContext'

export function usePushReminders(session: PrepSession, onSession: (s: PrepSession) => void) {
  const { t } = useLang()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'denied' | 'failed' | null>(null)
  const supported = pushSupported()
  const installed = isStandaloneDisplay()
  const needsInstall = !installed
  const shortcutOs = preferredShortcutOs()
  const canEnable = supported && installed

  async function enable() {
    setError(null)
    setBusy(true)
    try {
      onSession(
        await enablePush(session, { title: t('wa.pushReadyTitle'), body: t('wa.pushReadyBody') }),
      )
    } catch (err) {
      setError(err instanceof Error && err.message === 'denied' ? 'denied' : 'failed')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setError(null)
    setBusy(true)
    try {
      onSession(await disablePush(session))
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, supported, needsInstall, shortcutOs, canEnable, enable, disable }
}
