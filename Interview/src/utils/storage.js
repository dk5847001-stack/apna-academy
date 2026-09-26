const PREFIX = 'apnaacademy.interview.'

export function readSession(key, fallback) {
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeSession(key, value) {
  try {
    window.sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private browsing or embedded contexts.
  }
}

export function readPersistent(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writePersistent(key, value) {
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // Ignore storage failures; the app can continue in memory.
  }
}

export function removePersistent(key) {
  try {
    window.localStorage.removeItem(`${PREFIX}${key}`)
  } catch {
    // Ignore storage failures; the app can continue in memory.
  }
}

export function removeSession(key) {
  try {
    window.sessionStorage.removeItem(`${PREFIX}${key}`)
  } catch {
    // Ignore storage failures; the app can continue in memory.
  }
}
