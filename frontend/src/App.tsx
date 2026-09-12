import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { DraftBanner } from './components/ui'
import { LanguageBar } from './components/LanguageBar'
import { BottomNav } from './components/BottomNav'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { Timeline } from './screens/Timeline'
import { FoodChat } from './screens/FoodChat'
import { StoolGuide } from './screens/StoolGuide'
import { Reminders } from './screens/Reminders'
import { SessionBar } from './components/SessionBar'
import { PitchRail } from './components/PitchRail'
import { AppointmentChooser, ChangeDatePanel, StartOverSheet } from './components/AppointmentEdit'
import { ShortcutSheet } from './components/ShortcutSheet'
import { fadeY } from './lib/motion'
import { formatSessionWhen } from './lib/dates'
import { useLang } from './i18n/LanguageContext'
import { cn } from './lib/cn'
import { useAppointmentEdit } from './hooks/useAppointmentEdit'
import { useHomeTour } from './hooks/useHomeTour'
import { useSession } from './hooks/useSession'
import { isStandaloneDisplay } from './lib/push'
import { useState } from 'react'

export default function App() {
  const { lang, t } = useLang()
  const { session, setSession, screen, setScreen, ready, create, clear, update } = useSession()
  const edit = useAppointmentEdit()
  const [shortcut, setShortcut] = useState<'off' | 'ios' | 'android'>('off')
  useHomeTour(ready && !!session && screen === 'home')

  if (!ready) return null

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-full xl:grid xl:grid-cols-[minmax(0,1fr)_430px]">
      <PitchRail session={session} />

      <div
        data-app-column
        className="relative mx-auto flex h-full min-h-0 w-full max-w-107.5 flex-col overflow-hidden bg-paper xl:border-x xl:border-black/5"
      >
        <DraftBanner />
        <LanguageBar />
        {session && !isStandaloneDisplay() && openedFromExternalLink() && (
          <p className="shrink-0 bg-cream px-4 py-2 text-[13px] leading-snug text-teal-deep">
            {t('app.homescreenHint')}
          </p>
        )}
        <AnimatePresence mode="wait" initial={false}>
        {!session || screen === 'onboarding' ? (
          <motion.div
            key="onboarding"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            {...fadeY}
          >
          <Onboarding onComplete={create} />
          </motion.div>
        ) : (
          <motion.div
            key="session"
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
            {...fadeY}
          >
            <SessionBar session={session} onChange={edit.openChooser} />
            <div
              data-app-pane
              className={cn('relative min-h-0 flex-1', screen !== 'timeline' && '**:data-tl-fab:hidden')}
            >
              {(
                [
                  ['home', <Home session={session} onOpen={setScreen} onShortcut={setShortcut} />],
                  ['timeline', <Timeline session={session} onOpenStool={() => setScreen('stool')} />],
                  ['food', <FoodChat session={session} />],
                  ['stool', <StoolGuide session={session} onReminders={() => setScreen('reminders')} />],
                  ['reminders', <Reminders session={session} onSession={setSession} onShortcut={setShortcut} />],
                ] as const
              ).map(([id, node]) => (
                <div
                  key={id}
                  aria-hidden={screen !== id}
                  className={cn(
                    'absolute inset-0 overscroll-y-contain',
                    screen !== id && 'invisible pointer-events-none',
                    id === 'timeline' || id === 'food' ? 'overflow-hidden' : 'overflow-y-auto',
                  )}
                >
                  {node}
                </div>
              ))}
            </div>
            <BottomNav screen={screen} onChange={setScreen} />
            <AnimatePresence>
            {edit.edit === 'choose' && session && (
              <AppointmentChooser
                session={session}
                when={formatSessionWhen(session, lang)}
                onChangeDate={edit.openDate}
                onStartOver={edit.openRestart}
                onKeep={edit.close}
              />
            )}
            {edit.edit === 'date' && (
              <ChangeDatePanel
                session={session}
                error={edit.editError}
                busy={edit.savingEdit}
                onCancel={edit.close}
                onSave={(next) => edit.save(update, next)}
              />
            )}
            {edit.edit === 'restart' && (
              <StartOverSheet
                onBack={() => edit.setEdit('choose')}
                onConfirm={() => {
                  clear()
                  edit.setEdit('off')
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

function openedFromExternalLink() {
  const query = new URLSearchParams(window.location.search)
  return Boolean(query.get('s') || query.get('go'))
}
