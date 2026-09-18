import type { ApiDish, ApiDishChoice, ApiFoodChatStatus, ApiFoodSource } from './api/food'

const KEY = 'preppath.foodchat.v2'

export type FoodChatAnswer = {
  status: ApiFoodChatStatus
  message?: string | null
  matchedQuery?: string | null
  matchedSource?: ApiFoodSource | null
  dish?: ApiDish | null
  choices?: ApiDishChoice[] | null
}

export type FoodChatMsg = {
  id: string
  role: 'user' | 'bot'
  text?: string
  query?: string
  pending?: boolean
  answer?: FoodChatAnswer
}

type Stored = {
  sessionId: string
  messages: FoodChatMsg[]
}

export function loadFoodChat(sessionId: string): FoodChatMsg[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Stored
    if (parsed.sessionId !== sessionId || !Array.isArray(parsed.messages)) return []
    return parsed.messages.filter((m) => !m.pending)
  } catch {
    return []
  }
}

export function saveFoodChat(sessionId: string, messages: FoodChatMsg[]) {
  localStorage.setItem(KEY, JSON.stringify({ sessionId, messages } satisfies Stored))
}

export function clearFoodChat() {
  localStorage.removeItem(KEY)
}
