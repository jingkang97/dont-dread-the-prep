import { useEffect, useState } from 'react'
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
  loadSession,
  updateAppointment,
  type PrepSession,
  type Screen,
} from './lib/session'
import { HOSPITALS } from './data/hospitals'
import { SessionBar } from './components/SessionBar'
import { PitchRail } from './components/PitchRail'
import { AppointmentChooser, ChangeDatePanel, StartOverSheet } from './components/AppointmentEdit'

export default function App() {
  const [session, setSession] = useState<PrepSession | null>(null)
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [ready, setReady] = useState(false)
  const [edit, setEdit] = useState<'off' | 'choose' | 'date' | 'restart'>('off')

  useEffect(() => {
    const existing = loadSession()
    if (existing) {
      setSession(existing)
      setScreen('home')
    }
    setReady(true)
  }, [])

  if (!ready) return null

  const hospital = session ? HOSPITALS[session.hospitalId] : null

  return (
    <div className="h-svh xl:grid xl:grid-cols-[minmax(0,1fr)_430px]">
      <PitchRail session={session} />

      <div className="relative mx-auto flex h-svh min-h-0 w-full max-w-[430px] flex-col overflow-hidden bg-paper xl:h-full xl:border-x xl:border-black/5">
        <DraftBanner />
        <LanguageBar />
        {!session || screen === 'onboarding' ? (
          <Onboarding
            onComplete={(d) => {
              const next = createSession(d)
              setSession(next)
              setScreen('home')
            }}
          />
        ) : (
          <>
            <SessionBar session={session} onChange={() => setEdit('choose')} />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              {screen === 'home' && <Home session={session} onOpen={setScreen} />}
              {screen === 'timeline' && <Timeline session={session} />}
              {screen === 'food' && <FoodChat session={session} />}
              {screen === 'stool' && (
                <StoolGuide session={session} onReminders={() => setScreen('reminders')} />
              )}
              {screen === 'reminders' && <Reminders session={session} onSession={setSession} />}
            </div>
            <BottomNav screen={screen} onChange={setScreen} />
            {edit === 'choose' && hospital && (
              <AppointmentChooser
                hospitalShort={hospital.short}
                slot={session.slot}
                when={format(new Date(`${session.date}T${session.reportingTime}:00`), 'd MMM, h:mm a')}
                onChangeDate={() => setEdit('date')}
                onStartOver={() => setEdit('restart')}
                onKeep={() => setEdit('off')}
              />
            )}
            {edit === 'date' && (
              <ChangeDatePanel
                session={session}
                onCancel={() => setEdit('off')}
                onSave={(next) => {
                  setSession(updateAppointment(session, next))
                  setEdit('off')
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
          </>
        )}
      </div>
    </div>
  )
}
