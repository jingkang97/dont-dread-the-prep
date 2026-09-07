type Stored = {
  sessionId: string
  listTop: number
  landed: boolean
}

/** In-memory: first Food visit lands at the top; tab switches restore scroll; new answers jump to latest. */
let stored: Stored | null = null

export function loadFoodChatUi(sessionId: string): Stored | null {
  if (stored?.sessionId !== sessionId) return null
  return stored
}

export function saveFoodChatUi(sessionId: string, patch: Partial<Omit<Stored, 'sessionId'>>) {
  stored = {
    sessionId,
    listTop: patch.listTop ?? stored?.listTop ?? 0,
    landed: patch.landed ?? stored?.landed ?? false,
  }
}

export function clearFoodChatUi() {
  stored = null
}
