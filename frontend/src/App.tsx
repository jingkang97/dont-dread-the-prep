import { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { format } from 'date-fns'
import { DraftBanner } from './components/ui'
import { LanguageBar } from './components/LanguageBar'
import { BottomNav } from './components/BottomNav'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { Timeline } from './screens/Timeline'
import { FoodChat } from './screens/FoodChat'
import { StoolGuide } from './screens/StoolGuide'
import { Reminders } from './screens/Reminders'
import {
  clearSession,
  createSession,
  hydrateSession,
  updateAppointment,
  type PrepSession,
  type Screen,
} from './lib/session'
import { ApiError } from './lib/api'
import { HOSPITALS } from './data/hospitals'
import { SessionBar } from './components/SessionBar'
import { PitchRail } from './components/PitchRail'
import { AppointmentChooser, ChangeDatePanel, StartOverSheet } from './components/AppointmentEdit'
import { ShortcutSheet } from './components/ShortcutSheet'
import { easeOut } from './lib/motion'
import { DATE_LOCALES } from './lib/dateLocale'
import { useLang } from './i18n/LanguageContext'
import { cn } from './lib/cn'

export default function App() {
  const { lang } = useLang()
  const [session, setSession] = useState<PrepSession | null>(null)
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [ready, setReady] = useState(false)
  const [edit, setEdit] = useState<'off' | 'choose' | 'date' | 'restart'>('off')
  const [shortcut, setShortcut] = useState<'off' | 'ios' | 'android'>('off')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const existing = await hydrateSession()
      if (cancelled) return
      if (existing) {
        setSession(existing)
        setScreen('home')
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return null

  const hospital = session ? HOSPITALS[session.hospitalId] : null

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-full xl:grid xl:grid-cols-[minmax(0,1fr)_430px]">
      <PitchRail session={session} />

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden bg-paper xl:border-x xl:border-black/5">
        <DraftBanner />
        <LanguageBar />
        <AnimatePresence mode="wait" initial={false}>
        {!session || screen === 'onboarding' ? (
          <motion.div
            key="onboarding"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
          <Onboarding
            onComplete={async (d) => {
              const next = await createSession(d)
              setSession(next)
              setScreen('home')
            }}
          />
          </motion.div>
        ) : (
          <motion.div
            key="session"
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOut }}
          >
            <SessionBar
              session={session}
              onChange={() => {
                setEditError(null)
                setEdit('choose')
              }}
            />
            <div
              data-app-pane
              className={cn('relative min-h-0 flex-1', screen !== 'timeline' && '[&_[data-tl-fab]]:hidden')}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={
                    screen === 'home'
                      ? `home-${session.date}-${session.slot}-${session.reportingTime}`
                      : screen === 'timeline'
                        ? `timeline-${session.date}-${session.slot}-${session.reportingTime}`
                        : screen
                  }
                  className={cn(
                    'absolute inset-0 overscroll-y-contain',
                    screen === 'timeline' || screen === 'food' ? 'overflow-hidden' : 'overflow-y-auto',
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: easeOut }}
                >
              {screen === 'home' && (
                <Home session={session} onOpen={setScreen} onShortcut={setShortcut} />
              )}
              {screen === 'timeline' && <Timeline session={session} />}
              {screen === 'food' && <FoodChat session={session} />}
              {screen === 'stool' && (
                <StoolGuide session={session} onReminders={() => setScreen('reminders')} />
              )}
              {screen === 'reminders' && <Reminders session={session} onSession={setSession} />}
                </motion.div>
              </AnimatePresence>
            </div>
            <BottomNav screen={screen} onChange={setScreen} />
            <AnimatePresence>
            {edit === 'choose' && hospital && (
              <AppointmentChooser
                hospitalShort={hospital.short}
                slot={session.slot}
                when={format(new Date(`${session.date}T${session.reportingTime}:00`), 'd MMM, h:mm a', {
                  locale: DATE_LOCALES[lang],
                })}
                onChangeDate={() => {
                  setEditError(null)
                  setEdit('date')
                }}
                onStartOver={() => setEdit('restart')}
                onKeep={() => setEdit('off')}
              />
            )}
            {edit === 'date' && (
              <ChangeDatePanel
                session={session}
                error={editError}
                busy={savingEdit}
                onCancel={() => {
                  if (savingEdit) return
                  setEditError(null)
                  setEdit('off')
                }}
                onSave={async (next) => {
                  setSavingEdit(true)
                  setEditError(null)
                  try {
                    setSession(await updateAppointment(session, next))
                    setEdit('off')
                    setScreen('home')
                  } catch (err) {
                    setEditError(
                      err instanceof ApiError
                        ? err.detail
                        : 'Could not save. Check the API is running.',
                    )
                  } finally {
                    setSavingEdit(false)
                  }
                }}
              />
            )}
            {edit === 'restart' && (
              <StartOverSheet
                onBack={() => setEdit('choose')}
                onConfirm={() => {
                  clearSession()
                  setSession(null)
                  setEdit('off')
                  setScreen('onboarding')
                }}
              />
            )}
            {shortcut !== 'off' && (
              <ShortcutSheet
                key={`shortcut-${shortcut}`}
                initialOs={shortcut}
                onClose={() => setShortcut('off')}
              />
            )}
            </AnimatePresence>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
    </MotionConfig>
  )
}
