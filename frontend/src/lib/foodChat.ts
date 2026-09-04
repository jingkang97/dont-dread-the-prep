import type { ChatAnswer } from '../data/foods'
import type { StringKey } from '../i18n/strings'

const KEY = 'preppath.foodchat.v1'

export type FoodChatMsg = {
  id: string
  role: 'user' | 'bot'
  text?: string
  labelKey?: StringKey
  answer?: ChatAnswer
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
    return parsed.messages
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
