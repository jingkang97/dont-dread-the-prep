import { useState } from 'react'
import type { Slot } from '../data/hospitals'
import { ApiError } from '../lib/api'
import type { PrepSession } from '../lib/session'

export type EditMode = 'off' | 'choose' | 'date' | 'restart'

export function useAppointmentEdit() {
  const [edit, setEdit] = useState<EditMode>('off')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  function openChooser() {
    setEditError(null)
    setEdit('choose')
  }

  function openDate() {
    setEditError(null)
    setEdit('date')
  }

  function openRestart() {
    setEdit('restart')
  }

  function close() {
    if (savingEdit) return
    setEditError(null)
    setEdit('off')
  }

  async function save(
    apply: (next: { date: string; slot: Slot; reportingTime: string }) => Promise<PrepSession>,
    next: { date: string; slot: Slot; reportingTime: string },
  ) {
    setSavingEdit(true)
    setEditError(null)
    try {
      await apply(next)
      setEdit('off')
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.detail : 'Could not save. Check the API is running.',
      )
    } finally {
      setSavingEdit(false)
    }
  }

  return {
    edit,
    savingEdit,
    editError,
    openChooser,
    openDate,
    openRestart,
    close,
    save,
    setEdit,
  }
}
