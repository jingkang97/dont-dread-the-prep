import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { BottomNav } from './components/BottomNav'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { Timeline } from './screens/Timeline'
import { FoodChat } from './screens/FoodChat'
import { StoolGuide } from './screens/StoolGuide'
import { Contacts } from './screens/Contacts'
import { Reminders } from './screens/Reminders'
import { SessionBar } from './components/SessionBar'
import { PitchRail } from './components/PitchRail'
import { AppointmentChooser, ChangeDatePanel, StartOverSheet } from './components/AppointmentEdit'
import { ShortcutSheet } from './components/ShortcutSheet'
import { fadeY, pageSlide } from './lib/motion'
import { formatSessionWhen } from './lib/dates'
import { useLang } from './i18n/LanguageContext'
import { cn } from './lib/cn'
import { useAppointmentEdit } from './hooks/useAppointmentEdit'
import { useHomeTour } from './hooks/useHomeTour'
import { useSession } from './hooks/useSession'
import { startHomeTour } from './lib/homeTour'
import { isStandaloneDisplay } from './lib/push'
import { useRef, useState } from 'react'
import type { Screen } from './lib/session'

export default function App() {
  const { lang, t } = useLang()
  const { session, setSession, screen, setScreen, ready, create, clear, update } = useSession()
  const edit = useAppointmentEdit()
  const [shortcut, setShortcut] = useState<'off' | 'ios' | 'android'>('off')
  const homeLeafRef = useRef<'home' | 'reminders'>('home')
  if (!session || screen === 'onboarding') homeLeafRef.current = 'home'
  else if (screen === 'home' || screen === 'reminders') homeLeafRef.current = screen
  const homeLeaf = homeLeafRef.current
  const homeStack = screen === 'home' || screen === 'reminders'
  useHomeTour(ready && !!session && screen === 'home')

  function openTab(id: Screen) {
    setScreen(id === 'home' ? homeLeafRef.current : id)
  }

  if (!ready) return null

  return (
    <MotionConfig reducedMotion="user">
    <div className="h-full xl:grid xl:grid-cols-[minmax(0,1fr)_430px]">
      <PitchRail session={session} />

      <div
        data-app-column
        className="relative mx-auto flex h-full min-h-0 w-full max-w-107.5 flex-col overflow-hidden bg-paper xl:border-x xl:border-black/5"
      >
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
            <SessionBar
              session={session}
              onChange={edit.openChooser}
              onReplayTour={screen === 'home' ? () => startHomeTour({ t }) : undefined}
            />
            <div
              data-app-pane
              className={cn(
                'relative min-h-0 flex-1 overflow-hidden',
                screen !== 'timeline' && '**:data-tl-fab:hidden',
              )}
            >
              <div
                aria-hidden={screen !== 'home' && screen !== 'reminders'}
                className={cn(
                  'absolute inset-0 overflow-hidden',
                  screen !== 'home' && screen !== 'reminders' && 'invisible pointer-events-none',
                )}
              >
                <motion.div
                  initial={false}
                  animate={{ x: homeLeaf === 'reminders' ? '-100%' : 0 }}
                  transition={pageSlide(homeStack)}
                  aria-hidden={screen !== 'home'}
                  data-home-scroll
                  className="absolute inset-0 overflow-y-auto overscroll-y-contain"
                  style={{ pointerEvents: screen === 'home' ? 'auto' : 'none' }}
                >
                  <Home session={session} onOpen={setScreen} onShortcut={setShortcut} />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{ x: homeLeaf === 'reminders' ? 0 : '100%' }}
                  transition={pageSlide(homeStack)}
                  aria-hidden={screen !== 'reminders'}
                  className="absolute inset-0 overflow-y-auto overscroll-y-contain"
                  style={{ pointerEvents: screen === 'reminders' ? 'auto' : 'none' }}
                >
                  <Reminders
                    session={session}
                    onSession={setSession}
                    onShortcut={setShortcut}
                    onBack={() => setScreen('home')}
                  />
                </motion.div>
              </div>
              {(
                [
                  ['timeline', <Timeline session={session} onOpenStool={() => setScreen('stool')} />],
                  ['food', <FoodChat session={session} />],
                  ['stool', <StoolGuide session={session} />],
                  ['contacts', <Contacts session={session} />],
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
            <BottomNav screen={screen} onChange={openTab} />
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
