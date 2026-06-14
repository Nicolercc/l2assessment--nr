const HISTORY_KEY = 'triageHistory'

export function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function readExampleMessage() {
  try {
    return localStorage.getItem('exampleMessage')
  } catch {
    return null
  }
}

export function setExampleMessage(message) {
  localStorage.setItem('exampleMessage', message)
}

export function clearExampleMessage() {
  localStorage.removeItem('exampleMessage')
}
